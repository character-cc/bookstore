using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Security.Cryptography;
namespace Backend.Common.FakeData;

public class TestZalo
{
    static async Task Main(string[] args)
    {
        string app_id = "2554";
        string key1 = "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn";
        string create_order_url = "https://sb-openapi.zalopay.vn/v2/create";

        var app_trans_id = $"250619_{new Random().Next(1000000, 99999999)}"; 
        var app_time = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(); 
        var embed_data = new
        {
            redirecturl = "https://www.google.com/search?q=zalopay+test"
        };
        var items = new object[] { }; // hoặc để trống []

        var param = new Dictionary<string, string>
            {
                { "app_id", app_id },
                { "app_user", "demo_user" },
                { "app_time", app_time.ToString() },
                { "amount", "50000" },
                { "app_trans_id", app_trans_id },
                { "embed_data", JsonConvert.SerializeObject(embed_data) },
                { "item", JsonConvert.SerializeObject(items) },
                { "description", $"ZaloPay Demo - Thanh toán đơn hàng #{app_trans_id}" },
                { "bank_code", "zalopayapp" }
            };

        string data =
            $"{param["app_id"]}|{param["app_trans_id"]}|{param["app_user"]}|{param["amount"]}|{param["app_time"]}|{param["embed_data"]}|{param["item"]}";

        param["mac"] = ComputeHmacSha256(key1, data);

        var content = new FormUrlEncodedContent(param);

        using var client = new HttpClient();
        var response = await client.PostAsync(create_order_url, content);
        var responseContent = await response.Content.ReadAsStringAsync();

        Console.WriteLine("ZaloPay response:");
        Console.WriteLine(responseContent);
    }

    private static string ComputeHmacSha256(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
