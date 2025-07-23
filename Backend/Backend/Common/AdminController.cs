using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Common;

[Authorize(Roles = "Administrators")]

public class AdminController : CommonController
{
   
}
