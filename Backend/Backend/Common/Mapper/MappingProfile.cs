namespace Backend.Common.Mapper;

using AutoMapper;
using Backend.Common.Utils;
using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Cart;
using Backend.Data.Domain.Categories;
using Backend.Data.Domain.Discounts;
using Backend.Data.Domain.Orders;
using Backend.Data.Domain.Products;
using Backend.Data.Domain.Stores;
using Backend.Data.Domain.Users;
using Backend.DTO.Authors;
using Backend.DTO.Cart;
using Backend.DTO.Categories;
using Backend.DTO.Discounts;
using Backend.DTO.Identity;
using Backend.DTO.Orders;
using Backend.DTO.Products;
using Backend.DTO.Roles;
using Backend.DTO.Stores;
using Backend.DTO.Users;

public class MappingProfile : Profile
{
    public MappingProfile() 
    {
        CreateMap<RegisterRequest, User>().ForMember(dest => dest.PasswordHash ,
            opt => opt.MapFrom(src => Hasher.HashPassword(src.Password)));
        CreateMap<CreateAddressRequest, Address>();
        CreateMap<UpdateAddressRequest, Address>();
        CreateMap<Address , AddressDto>();
        CreateMap<Role, RoleDto>();
        CreateMap<User, UserDto>();
        CreateMap<CreateUserRequest, User>();
        CreateMap<UpdateUserRequest, User>();

        CreateMap<CreateRoleRequest, Role>();
        CreateMap<UpdateRoleRequest, Role>();
        CreateMap<Book, BookDto>();
        CreateMap<Author, AuthorDTO>();
        CreateMap<BookImage, BookImageDto>();
        CreateMap<Category, CategoryDto>();
        CreateMap<Publisher, PublisherDto>();
        CreateMap<CreateBookRequest, Book>();
        CreateMap<BookImage, BookImageDto>();
        CreateMap<CreateCustomAttributeRequest, CustomAttribute>();
        CreateMap<CreateAttributeValueRequest, AttributeValue>();
        CreateMap<CustomAttribute, CustomAttributeDto>();
        CreateMap<AttributeValue, AttributeValueDto>();
        CreateMap<Category, CategoryHomeDto>();
        CreateMap<Author, AuthorHomeDto>();
        CreateMap<Discount, DiscountDto>()
                    .ForMember(dest => dest.ApplicableDiscountBookIds,
                        opt => opt.MapFrom(src => src.ApplicableDiscountBooks.Select(x => x.BookId)));
                    //.ForMember(dest => dest.ExcludedDiscountBookIds,
                    //    opt => opt.MapFrom(src => src.ExcludedDiscountBooks.Select(x => x.BookId)))
                    //.ForMember(dest => dest.DiscountRoleIds,
                    //    opt => opt.MapFrom(src => src.DiscountRoles.Select(x => x.RoleId)));
        CreateMap<DiscountCreateOrUpdateDto, Discount>();
        CreateMap<CartItem, CartItemDto>();
        CreateMap<Order, OrderDto>();
        CreateMap<OrderItem, OrderItemDto>();
        CreateMap<ShippingTracking, ShippingTrackingDto>();
        CreateMap<ShippingTrackingDto, ShippingTracking>();

        CreateMap<CreateOrUpdateStoreRequest, Store>();
        CreateMap<Store, StoreDto>();

        CreateMap<CreateOrUpdateStoreBookRequest, StoreBook>();
        CreateMap<StoreBook, StoreBookDto>();
        CreateMap<AuthorRequestDto, Author>();

        CreateMap<CategoryRequestDto, Category>();
        CreateMap<PublisherRequestDto, Publisher>();

        CreateMap<CreateImportBookRequest, ImportBook>();
        CreateMap<ImportBook, ImportBookDto>();

    }
}
