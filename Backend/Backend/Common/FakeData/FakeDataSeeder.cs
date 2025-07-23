using Bogus;
using Microsoft.AspNetCore.Identity;
using Backend.Common.Utils;
using Backend.Data.Domain;
using Backend.Data.Domain.Users;
using Backend.Data.Domain.Users.Enum;
using Backend.Data;
using LinqToDB;
using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Products.Enum;
using Backend.Data.Domain.Products;
using Microsoft.SqlServer.Server;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Discounts;

namespace Backend.Common.FakeData;

public static class FakeDataSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var roleRepo = scope.ServiceProvider.GetRequiredService<IRepository<Role>>();
        var userRepo = scope.ServiceProvider.GetRequiredService<IRepository<User>>();
        var userRoleRepo = scope.ServiceProvider.GetRequiredService<IRepository<UserRole>>();
        var authorRepo = scope.ServiceProvider.GetRequiredService<IRepository<Author>>();

        var existingRoles = await roleRepo.EntitySet.ToListAsync();
        var roleDict = existingRoles.ToDictionary(r => r.SystemName);

        var systemRoles = new List<Role>
    {
        new Role
        {
            FriendlyName = "Administrator",
            SystemName = UserDefaults.AdminRoleName,
            IsSystemRole = true,
            IsActive = true,
            IsFreeShipping = false
        },
        new Role
        {
            FriendlyName = "Registered User",
            SystemName = UserDefaults.RegisteredRoleName,
            IsSystemRole = true,
            IsActive = true,
            IsFreeShipping = false
        },
        new Role
        {
            FriendlyName = "Guest",
            SystemName = UserDefaults.GuestsRoleName,
            IsSystemRole = true,
            IsActive = true,
            IsFreeShipping = false
        }
    };

        var newRoles = systemRoles
            .Where(r => !roleDict.ContainsKey(r.SystemName))
            .ToList();

        if (newRoles.Any())
        {
            await roleRepo.InsertAsync(newRoles);
        }

        if (!await userRepo.EntitySet.AnyAsync())
        {
            var allRoles = await roleRepo.EntitySet.ToListAsync();

            var fakerUser = new Faker<User>()
                .RuleFor(u => u.Username, f => f.Internet.UserName())
                .RuleFor(u => u.FirstName, f => f.Name.FirstName())
                .RuleFor(u => u.LastName, f => f.Name.LastName())
                .RuleFor(u => u.Gender, f => f.PickRandom<Gender>())
                .RuleFor(u => u.Email, f => f.Internet.Email())
                .RuleFor(u => u.PhoneNumber, f => f.Phone.PhoneNumber())
                .RuleFor(u => u.PasswordHash, f => f.Internet.Password())
                .RuleFor(u => u.DateOfBirth, f => DateTime.UtcNow)
                .RuleFor(u => u.CreatedAt, f => DateTime.UtcNow)
                .RuleFor(u => u.UpdatedAt, f => DateTime.UtcNow)
                .RuleFor(u => u.IsActive, f => true)
                .RuleFor(u => u.Roles, f => new List<Role> { f.PickRandom(allRoles) });

            var fakeUsers = fakerUser.Generate(10);

            var adminRole = allRoles.First(r => r.SystemName == UserDefaults.AdminRoleName);
            var adminUser = new User
            {
                Username = "admin",
                FirstName = "Admin",
                LastName = "Super",
                Email = "admin@example.com",
                PhoneNumber = "0000000000",
                Gender = Gender.Male,
                PasswordHash = Hasher.HashPassword("admin"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Roles = new List<Role> { adminRole }
            }; 
            fakeUsers.Add(adminUser);
            var users = await userRepo.InsertAsync(fakeUsers);
        
            await userRoleRepo.InsertAsync(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });
           
        }

        //var bookRepo = scope.ServiceProvider.GetRequiredService<IRepository<Book>>();
        //var publisherRepo = scope.ServiceProvider.GetRequiredService<IRepository<Publisher>>();
        //var categoryRepo = scope.ServiceProvider.GetRequiredService<IRepository<Category>>();
        //var bookAuthorRepo = scope.ServiceProvider.GetRequiredService<IRepository<BookAuthor>>();
        //var bookCategoryRepo = scope.ServiceProvider.GetRequiredService<IRepository<BookCategory>>();
        //var bookPublisherRepo = scope.ServiceProvider.GetRequiredService<IRepository<BookPublisher>>();
        //var bookImageRepo = scope.ServiceProvider.GetRequiredService<IRepository<BookImage>>();
        //var customAttributeRepo = scope.ServiceProvider.GetRequiredService<IRepository<CustomAttribute>>();
        //var attributeValueRepo = scope.ServiceProvider.GetRequiredService<IRepository<AttributeValue>>();
        //var attributeCombinationRepo = scope.ServiceProvider.GetRequiredService<IRepository<AttributeCombination>>();

        //var faker = new Faker(); // Initialize Bogus Faker

        //// Seed Authors
        //if (!await authorRepo.EntitySet.AnyAsync())
        //{
        //    var fakerAuthor = new Faker<Author>()
        //        .RuleFor(a => a.Name, f => f.Name.FullName())
        //        .RuleFor(a => a.Biography, f => f.Lorem.Paragraph())
        //        .RuleFor(a => a.ImageUrl, f => f.Image.PicsumUrl())
        //        .RuleFor(a => a.CreatedAt, f => DateTime.UtcNow)
        //        .RuleFor(a => a.UpdatedAt, f => DateTime.UtcNow);

        //    var authors = fakerAuthor.Generate(20);
        //    await authorRepo.InsertAsync(authors);
        //}

        //// Seed Publishers
        //if (!await publisherRepo.EntitySet.AnyAsync())
        //{
        //    var fakerPublisher = new Faker<Publisher>()
        //        .RuleFor(p => p.Name, f => f.Company.CompanyName())
        //        .RuleFor(p => p.Description, f => f.Lorem.Paragraph())
        //        .RuleFor(p => p.Website, f => f.Internet.Url())
        //        .RuleFor(p => p.LogoUrl, f => f.Image.PicsumUrl())
        //        .RuleFor(p => p.CreatedAt, f => DateTime.UtcNow)
        //        .RuleFor(p => p.UpdatedAt, f => DateTime.UtcNow);

        //    var publishers = fakerPublisher.Generate(10);
        //    await publisherRepo.InsertAsync(publishers);
        //}

        //// Seed Categories
        //if (!await categoryRepo.EntitySet.AnyAsync())
        //{
        //    var fakerCategory = new Faker<Category>()
        //        .RuleFor(c => c.Name, f => f.Commerce.Categories(1)[0])
        //        .RuleFor(c => c.Description, f => f.Lorem.Sentence())
        //        .RuleFor(c => c.ImageUrl, f => f.Image.PicsumUrl())
        //        .RuleFor(c => c.IsShowOnHomepage, f => f.Random.Bool())
        //        .RuleFor(c => c.HomepageDisplayOrder, f => f.Random.Int(0, 10))
        //        .RuleFor(c => c.IsShowOnNavigationBar, f => f.Random.Bool())
        //        .RuleFor(c => c.NavigationDisplayOrder, f => f.Random.Int(0, 10))
        //        .RuleFor(c => c.CreatedAt, f => DateTime.UtcNow)
        //        .RuleFor(c => c.UpdatedAt, f => DateTime.UtcNow);

        //    var categories = fakerCategory.Generate(15);
        //    var parentCategories = categories.Take(5).ToList();
        //    foreach (var category in categories.Skip(5))
        //    {
        //        category.ParentId = parentCategories[faker.Random.Int(0, parentCategories.Count - 1)].Id;
        //    }
        //    await categoryRepo.InsertAsync(categories);
        //}

        //// Seed Books and related entities
        //if (!await bookRepo.EntitySet.AnyAsync())
        //{
        //    var allAuthors = await authorRepo.EntitySet.ToListAsync();
        //    var allPublishers = await publisherRepo.EntitySet.ToListAsync();
        //    var allCategories = await categoryRepo.EntitySet.ToListAsync();

        //    var fakerBook = new Faker<Book>()
        //        .RuleFor(b => b.Name, f => f.Commerce.ProductName())
        //        .RuleFor(b => b.Isbn, f => f.Commerce.Ean13())
        //        .RuleFor(b => b.CostPrice, f => f.Random.Decimal(5, 20))
        //        .RuleFor(b => b.OriginalPrice, f => f.Random.Decimal(20, 50))
        //        .RuleFor(b => b.SalePrice, (f, b) => b.OriginalPrice * f.Random.Decimal(0.7m, 1m))
        //        .RuleFor(b => b.Published, f => true)
        //        .RuleFor(b => b.ShortDescription, f => f.Lorem.Sentence())
        //        .RuleFor(b => b.FullDescription, f => f.Lorem.Paragraphs(2))
        //        //.RuleFor(b => b.Language, f => f.Random.Int(1, 3))
        //        .RuleFor(b => b.IsGift, f => f.Random.Bool(0.1f))
        //        .RuleFor(b => b.PageCount, f => f.Random.Int(100, 500))
        //        .RuleFor(b => b.InventoryManagementMethodId, f => f.Random.Int(1, 2))
        //        .RuleFor(b => b.StockQuantity, f => f.Random.Int(0, 100))
        //        .RuleFor(b => b.LowStockThreshold, f => f.Random.Int(5, 10))
        //        .RuleFor(b => b.MarkAsBestseller, f => f.Random.Bool(0.2f))
        //        .RuleFor(b => b.MarkAsNew, f => f.Random.Bool(0.3f))
        //        .RuleFor(b => b.IsShowAsNewOnHome, f => f.Random.Bool(0.1f))
        //        .RuleFor(b => b.IsShowAsBestsellerOnHome, f => f.Random.Bool(0.1f))
        //        .RuleFor(b => b.DisplayOrderBestseller, f => f.Random.Int(0, 10))
        //        .RuleFor(b => b.DisplayOrderAsNew, f => f.Random.Int(0, 10))
        //        .RuleFor(b => b.DisplayOrderAsSale, f => f.Random.Int(0, 10))
        //        .RuleFor(b => b.CreatedAt, f => DateTime.UtcNow)
        //        .RuleFor(b => b.UpdatedAt, f => DateTime.UtcNow);

        //    var books = fakerBook.Generate(50);

        //    // Seed Books
        //    await bookRepo.InsertAsync(books);

        //    // Seed BookImages, BookAuthors, BookCategories, BookPublishers, CustomAttributes
        //    foreach (var book in books)
        //    {
        //        // BookImages
        //        var bookImages = new Faker<BookImage>()
        //            .RuleFor(i => i.BookId, book.Id)
        //            .RuleFor(i => i.ImageUrl, f => f.Image.PicsumUrl())
        //            .RuleFor(i => i.CreatedAt, f => DateTime.UtcNow)
        //            .RuleFor(i => i.UpdatedAt, f => DateTime.UtcNow)
        //            .Generate(faker.Random.Int(1, 3));

        //        await bookImageRepo.InsertAsync(bookImages);

        //        // BookAuthors
        //        var bookAuthors = allAuthors.OrderBy(x => faker.Random.Guid()).Take(faker.Random.Int(1, 3))
        //            .Select(a => new BookAuthor { BookId = book.Id, AuthorId = a.Id });
        //        await bookAuthorRepo.InsertAsync(bookAuthors);

        //        // BookCategories
        //        var bookCategories = allCategories.OrderBy(x => faker.Random.Guid()).Take(faker.Random.Int(1, 3))
        //            .Select(c => new BookCategory { BookId = book.Id, CategoryId = c.Id });
        //        await bookCategoryRepo.InsertAsync(bookCategories);

        //        // BookPublishers
        //        var bookPublisher = new BookPublisher
        //        {
        //            BookId = book.Id,
        //            PublisherId = faker.PickRandom(allPublishers).Id
        //        };
        //        await bookPublisherRepo.InsertAsync(bookPublisher);

        //        // CustomAttributes
        //        var customAttributes = new List<CustomAttribute>
        //            {
        //                new CustomAttribute
        //                {
        //                    BookId = book.Id,
        //                    Name = "Format_Language",
        //                    CustomAttributeTypeId = (int)CustomAttributeType.DropDown,
        //                    Tooltip = "Chọn định dạng và ngôn ngữ",
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                },
        //                new CustomAttribute
        //                {
        //                    BookId = book.Id,
        //                    Name = "Signed",
        //                    CustomAttributeTypeId = (int)CustomAttributeType.CheckBox,
        //                    Tooltip = "Chữ ký chỉ khả dụng cho sách vật lý Tiếng Việt",
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                }
        //            };

        //        await customAttributeRepo.InsertAsync(customAttributes);

        //        // AttributeValues
        //        var attributeValues = new List<AttributeValue>();
        //        var formatAttr = customAttributes.First(a => a.Name == "Format_Language");
        //        var signedAttr = customAttributes.First(a => a.Name == "Signed");

        //        attributeValues.AddRange(new[]
        //        {
        //                new AttributeValue
        //                {
        //                    AttributeId = formatAttr.Id,
        //                    Value = "Hardcover_Vietnamese",
        //                    Label = "Bìa cứng_Tiếng Việt",
        //                    IsVariant = true,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                },
        //                new AttributeValue
        //                {
        //                    AttributeId = formatAttr.Id,
        //                    Value = "Ebook_Vietnamese",
        //                    Label = "Ebook_Tiếng Việt",
        //                    IsVariant = true,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                },
        //                new AttributeValue
        //                {
        //                    AttributeId = formatAttr.Id,
        //                    Value = "Audiobook",
        //                    Label = "Audiobook",
        //                    IsVariant = false,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                },
        //                new AttributeValue
        //                {
        //                    AttributeId = signedAttr.Id,
        //                    Value = "Yes",
        //                    Label = "Có",
        //                    PriceAdjustment = 50000,
        //                    IsVariant = true,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                },
        //                new AttributeValue
        //                {
        //                    AttributeId = signedAttr.Id,
        //                    Value = "No",
        //                    Label = "Không",
        //                    IsVariant = true,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                }
        //            });

        //        await attributeValueRepo.InsertAsync(attributeValues);

        //        var formatValues = attributeValues.Where(v => v.AttributeId == formatAttr.Id && v.IsVariant).ToList();
        //        var attributeCombinations = new List<AttributeCombination>();

        //        foreach (var format in formatValues)
        //        {
        //            var signedValues = format.Value.Contains("Vietnamese")
        //                ? attributeValues.Where(v => v.AttributeId == signedAttr.Id).Select(v => v.Value)
        //                : new[] { "No" };

        //            foreach (var signed in signedValues)
        //            {
        //                var combo = new AttributeCombination
        //                {
        //                    BookId = book.Id,
        //                    Attributes = new Dictionary<string, string>
        //                        {
        //                            { "Format_Language", format.Value },
        //                            { "Signed", signed }
        //                        },
        //                    Sku = $"{book.Isbn}-{format.Value}-{signed}",
        //                    Price = book.SalePrice + (signed == "Yes" ? 50000 : 0),
        //                    StockQuantity = format.Value.StartsWith("Ebook") ? 0 : faker.Random.Int(10, 100),
        //                    LowStockThreshold = 5,
        //                    IsActive = true,
        //                    CreatedAt = DateTime.UtcNow,
        //                    UpdatedAt = DateTime.UtcNow
        //                };
        //                attributeCombinations.Add(combo);
        //            }
        //        }

        //        await attributeCombinationRepo.InsertAsync(attributeCombinations);
        //    }
        //}
        //var cartItemRepo = scope.ServiceProvider.GetRequiredService<IRepository<CartItem>>();
        //var cartItemAttrRepo = scope.ServiceProvider.GetRequiredService<IRepository<CartItemAttribute>>();
        //var discountRepo = scope.ServiceProvider.GetRequiredService<IRepository<Discount>>();
        //var applicableDiscountBookRepo = scope.ServiceProvider.GetRequiredService<IRepository<ApplicableDiscountBook>>();
        //var excludedDiscountBookRepo = scope.ServiceProvider.GetRequiredService<IRepository<ExcludedDiscountBook>>();
        //var discountRoleRepo = scope.ServiceProvider.GetRequiredService<IRepository<DiscountRole>>();

        //var userIds = await userRepo.EntitySet.Select(u => u.Id).Take(5).ToListAsync();
        //var bookIds = await bookRepo.EntitySet.Select(b => b.Id).Take(10).ToListAsync();
        //var roleIds = await roleRepo.EntitySet.Select(r => r.Id).Take(2).ToListAsync();

        //var random = new Random();

        //foreach (var userId in userIds)
        //{
        //    var cartItem = new CartItem
        //    {
        //        UserId = userId,
        //        BookId = random.Next(1, 10),
        //        Quantity = random.Next(1, 4)
        //    };
        //    await cartItemRepo.InsertAsync(cartItem);

        //    // Giả sử BookAttributeValueId có sẵn 5 giá trị
        //    for (int i = 0; i < random.Next(0, 3); i++)
        //    {
        //        var attr = new CartItemAttribute
        //        {
        //            CartItemId = cartItem.Id,
        //            BookAttributeValueId = random.Next(1, 6)
        //        };
        //        await cartItemAttrRepo.InsertAsync(attr);
        //    }
        //}

        //for (int i = 0; i < 5; i++)
        //{
        //    var discount = new Discount
        //    {
        //        Code = $"SALE{i + 1}0",
        //        Description = $"Giảm giá {i + 1}0%",
        //        DiscountPercentage = 10 * (i + 1),
        //        IsPercentage = true,
        //        StartDate = DateTime.UtcNow,
        //        EndDate = DateTime.UtcNow.AddDays(30),
        //        IsActive = true,
        //        MinimumOrderAmount = 100000,
        //        MaxUsagePerUser = 1,
        //        TotalUsageLimit = 100
        //    };
        //    await discountRepo.InsertAsync(discount);


        //    // Loại trừ 1 sách ngẫu nhiên
        //    await excludedDiscountBookRepo.InsertAsync(new ExcludedDiscountBook
        //    {
        //        DiscountId = discount.Id,
        //        BookId = random.Next(1, 10)
        //    });

        //    // Gán role áp dụng
        //    await discountRoleRepo.InsertAsync(new DiscountRole
        //    {
        //        DiscountId = discount.Id,
        //        RoleId = random.Next(1, 3)
        //    });
        //}
    }
}
