using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Common;

public class CommonController : ControllerBase
{
    public int GetUserId()
    {
        var userId = User.FindFirstValue(CustomClaimTypes.USER_ID);
        if (string.IsNullOrEmpty(userId))
            return 0;
        return int.Parse(userId);

    }
}
