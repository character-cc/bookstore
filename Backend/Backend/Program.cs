using System;
using System.Text.Json;
using Backend.Common.FakeData;
using Backend.Common.Mapper;
using Backend.Data;
using Backend.Data.Domain;
using Backend.Data.Migrations;
using Backend.DTO.Identity;
using Backend.Services.Identity;
using Backend.Services.Users;
using FluentMigrator.Runner;
using FluentValidation;
using FluentValidation.AspNetCore;
using LinqToDB.AspNet;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using LinqToDB.Configuration;
using LinqToDB;
using Backend.Services.Products;
using Backend.Services.Categories;
using Backend.Services.Authors;
using Backend.Services.Cart;
using Backend.Services.Discounts;
using Backend.Services.Orders;
using Backend.Services.Email;
using Backend.Services.Stores;
using Backend.Services.Shipping;
using Backend.Services.ScheduleTasks;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddFluentMigratorCore()
    .ConfigureRunner(rb => rb
        .AddSqlServer()
        .WithGlobalConnectionString(builder.Configuration.GetConnectionString("DefaultConnection"))
        .ScanIn(typeof(CreateUserRoleAddressTables).Assembly).For.Migrations())
    .AddLogging(lb => lb.AddFluentMigratorConsole());


builder.Services.AddControllers();

builder.Services.AddLinqToDBContext<AppDataConnection>((provider, options) =>
{
    return options
        .UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});



builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });



builder.Services.AddScoped(typeof(IRepository<>), typeof(EntityRepository<>));
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPublisherService, PublisherService>();
builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IDiscountService, DiscountService>();
builder.Services.AddScoped<ICheckoutService, CheckoutService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<IStoreService, StoreService>();
builder.Services.AddHttpClient<IShippingService, ShippingService>();
builder.Services.Configure<ShippingOptions>(builder.Configuration.GetSection("Shipping"));
builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddSingleton<ITaskStartup, TaskStartup>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAutoMapper(typeof(MappingProfile)); 
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddHttpClient();

builder.Services.AddValidatorsFromAssemblyContaining<RegisterModelValidator>();
builder.Services.AddControllers()

    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
var app = builder.Build();




app.UseHttpsRedirection();     
app.UseStaticFiles();          
app.UseRouting();             
app.UseAuthentication();      
app.UseAuthorization();       
app.MapControllers();  
using (var scope = app.Services.CreateScope())
{
    var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();

    runner.MigrateUp();


    if (app.Environment.IsDevelopment())
{
        //await FakeDataSeeder.SeedAsync(app.Services);
    }

    var taskStartup = scope.ServiceProvider.GetRequiredService<ITaskStartup>();
    await taskStartup.InitializeAsync();
    await taskStartup.Start();
}   
app.Run();                     
