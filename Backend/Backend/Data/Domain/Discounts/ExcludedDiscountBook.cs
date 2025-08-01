﻿using Backend.Data.Domain.Products;
using LinqToDB.Mapping;

namespace Backend.Data.Domain.Discounts;


[Table]
public class ExcludedDiscountBook : IEntity
{
    [Column, NotNull]
    public int DiscountId { get; set; }

    [Column, NotNull]
    public int BookId { get; set; }

}
