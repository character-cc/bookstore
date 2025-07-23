using Backend.Common;
using Backend.Services.Shipping;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

public class ImageController : PublicController
{
    private readonly IShippingService _shippingService;

    public ImageController(IShippingService shippingService)
    {
        _shippingService = shippingService ?? throw new ArgumentNullException(nameof(shippingService), "Shipping service is not initialized.");
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"http://localhost/api/uploads/{fileName}";
        return Ok(new { url });
    }

    [HttpPost("/uploads")]
    public async Task<IActionResult> Upload(List<IFormFile> files)
    {
        var uploadedUrls = new List<string>();

        foreach (var file in files)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine("wwwroot/uploads", fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            uploadedUrls.Add($"http://localhost/api/uploads/{fileName}"); // Trả về đường dẫn tương đối
        }

        return Ok(uploadedUrls);
    }

    [HttpGet("test")]
    public async Task<IActionResult> Test()
    {
        var payload = new
        {
            service_type_id = 2,
            from_district_id = 1442,
            from_ward_code = "21211",
            to_district_id = 1820,
            to_ward_code = "030712",
            weight = 120,
            length = 25,
            width = 20,
            height = 5,
            cod_value = 250000
        };

        var result = await _shippingService.CreateOrderAsync(payload);
        return Ok(result);

    }
}
