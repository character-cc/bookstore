﻿namespace Backend.DTO.Authors;

public class PublisherDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public string Website { get; set; } 
    public string LogoUrl { get; set; } 
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
