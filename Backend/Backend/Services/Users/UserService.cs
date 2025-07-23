using System.Linq;
using System.Linq.Expressions;
using System.Net.Sockets;
using AutoMapper;
using Backend.Common;
using Backend.Common.Utils;
using Backend.Data;
using Backend.Data.Domain;
using Backend.Data.Domain.Users;
using Backend.Data.Domain.Users.Enum;
using Backend.DTO.Roles;
using Backend.DTO.Users;
using Backend.Services.Email;
using LinqToDB;

namespace Backend.Services.Users;

public class UserService : IUserService
{
    private readonly IRepository<User> _userRepository;

    private readonly IRepository<Role> _roleRepository;

    private readonly IRepository<UserRole> _userRoleRepository;

    private readonly IRepository<Address> _addressRepository;

    private readonly IRepository<EmailOtp> _emailOtpRepository;

    private readonly IEmailSender _emailService;

    private readonly IEmailTemplateService _emailTemplateService;

    private readonly IMapper _mapper;

    public UserService(IRepository<User> userRepository, IRepository<Role> roleRepository, IRepository<UserRole> userRoleRepository, IRepository<Address> addressRepository, IRepository<EmailOtp> emailOtpRepository, IEmailSender emailService, IEmailTemplateService emailTemplateService, IMapper mapper)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _userRoleRepository = userRoleRepository;
        _addressRepository = addressRepository;
        _emailOtpRepository = emailOtpRepository;
        _emailService = emailService;
        _emailTemplateService = emailTemplateService;
        _mapper = mapper;
    }


    public async Task SendOtpAsync(string email){
        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();
        var emailOtp = new EmailOtp
        {
            Email = email,
            OtpCode = otpCode,
            ExpriedAt = DateTime.UtcNow.AddDays(1) 
        };
        await _emailOtpRepository.EntitySet
            .Where(e => e.Email == email)
            .DeleteAsync();
        await _emailOtpRepository.InsertAsync(emailOtp);
        var emailContent = await _emailTemplateService.RenderOtpEmailAsync(otpCode);
        await _emailService.SendEmailAsync(email, "Mã Otp của bạn", emailContent);
    }

    public async Task<bool> VerifyOtpAsync(string email, string otp)
    {
        var emailOtp = await _emailOtpRepository.EntitySet
            .FirstOrDefaultAsync(e => e.Email == email && e.OtpCode == otp && e.ExpriedAt > DateTime.UtcNow);
        if (emailOtp == null)
        {
            return false; 
        }

        await _emailOtpRepository.EntitySet
            .Where(e => e.Email == email )
            .DeleteAsync();
        return true; 
    }

    #region user

    public async Task<IPagedList<User>> GetUsersForDiscountAsync(string keyword, int pageIndex = 0, int pageSize = int.MaxValue)
    {
        var query = _userRepository.EntitySet
            .Where(u => !u.IsDeleted && u.IsActive);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(u => u.FirstName.Contains(keyword) || u.LastName.Contains(keyword) || u.Email.Contains(keyword));
        }
        return await query.ToPagedListAsync(pageIndex, pageSize);
    }

    public async Task<User> GetUserByUsernameOrEmailAsync(string usernameOrEmail)
    {
        ArgumentNullException.ThrowIfNull(usernameOrEmail, nameof(usernameOrEmail));
        return await _userRepository.EntitySet.FirstOrDefaultAsync(c => c.Username == usernameOrEmail || c.Email == usernameOrEmail);
    }

    public async Task<IPagedList<User>> GetAllUsersAsync(
     string fullName = null,
     string firstName = null,
     string lastName = null,
     string email = null,
     string phone = null,
     bool? isActive = null,
     int[] userRoleIds = null,
     DateTime? createdFrom = null,
     DateTime? createdTo = null,
     Expression<Func<User, object>> orderBy = null,
     bool? orderDesc = null,
     int pageIndex = 0,
     int pageSize = int.MaxValue,
     bool getOnlyTotalCount = false)
    {
        var query = _userRepository.EntitySet.LoadWith(u => u.Roles).Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(fullName))
            query = query.Where(u => (u.FirstName + " " + u.LastName).Contains(fullName));

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(u => u.Email.Contains(email));

        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(u => u.PhoneNumber.Contains(phone));

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (createdFrom.HasValue)
            query = query.Where(u => u.CreatedAt >= createdFrom.Value);

        if (createdTo.HasValue)
            query = query.Where(u => u.CreatedAt <= createdTo.Value);

        if (userRoleIds?.Length > 0)
        {
            query = from u in query
                    join ur in _userRoleRepository.EntitySet on u.Id equals ur.UserId
                    where userRoleIds.Contains(ur.RoleId)
                    select u;
        }

        if (orderBy != null)
        {
            query = (orderDesc ?? false)
                ? query.OrderByDescending(orderBy)
                : query.OrderBy(orderBy);
        }

        return await query.ToPagedListAsync(pageIndex, pageSize, getOnlyTotalCount);
    }

    public async Task<int> DeleteUserAsync(User user)
    {
        return await _userRepository.DeleteAsync(user);
    }

    public async Task<DeleteUserResult> ValidateUserDeletionAsync(int userIdToDelete, int currentUserId)
    {
        if (userIdToDelete == currentUserId)
            return DeleteUserResult.CannotDeleteSelf;

        var userExists = await _userRepository.EntitySet
            .AnyAsync(u => u.Id == userIdToDelete);

        if (!userExists)
            return DeleteUserResult.NotFound;

        var isAdmin = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where ur.UserId == userIdToDelete && r.SystemName == UserDefaults.AdminRoleName
            select r.Id
        ).AnyAsync();

        if (isAdmin)
            return DeleteUserResult.CannotDeleteAdmin;

        return DeleteUserResult.Success;
    }



    public async Task<int> DeleteUsersAsync(IEnumerable<User> users)
    {
        return await _userRepository.DeleteAsync(users);
    }

    public async Task<(List<int> DeletableIds, Dictionary<int, DeleteUserResult> Failures)> FilterDeletableUsersAsync
        (List<int> userIdsToDelete, int currentUserId)
    {
        var results = new Dictionary<int, DeleteUserResult>();
        var deletableIds = new List<int>();

        var users = await _userRepository.EntitySet
            .Where(u => userIdsToDelete.Contains(u.Id))
            .ToListAsync();

        var foundIds = users.Select(u => u.Id).ToHashSet();

        foreach (var id in userIdsToDelete)
        {
            if (!foundIds.Contains(id))
                results[id] = DeleteUserResult.NotFound;
        }

        var adminUserIds = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where r.SystemName == UserDefaults.AdminRoleName
                  && userIdsToDelete.Contains(ur.UserId)
            select ur.UserId
        ).Distinct().ToListAsync();

        foreach (var user in users)
        {
            if (user.Id == currentUserId)
                results[user.Id] = DeleteUserResult.CannotDeleteSelf;
            else if (adminUserIds.Contains(user.Id))
                results[user.Id] = DeleteUserResult.CannotDeleteAdmin;
            else
                deletableIds.Add(user.Id);
        }

        return (deletableIds, results);
    }


    public async Task<BulkOperationResult> BulkSetUserActiveStatusAsync(List<int> userIds, bool isActive, int currentUserId)
    {
        var failed = new List<BulkErrorItem>();
        var validUserIds = new List<int>();

        var users = await _userRepository.EntitySet
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();
        if (isActive == true)
        {
            await _userRepository.Table
                .Where(u => userIds.Contains(u.Id))
                .Set(u => u.IsActive, isActive)
                .Set(u => u.UpdatedAt, DateTime.UtcNow)
                .UpdateAsync();
            return new BulkOperationResult
            {
                SuccessIds = userIds,
                Errors = failed
            };
        }

        var foundIds = users.Select(u => u.Id).ToList();

        var adminUserIds = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where r.SystemName == UserDefaults.AdminRoleName
                && foundIds.Contains(ur.UserId)
            select ur.UserId
        ).Distinct().ToListAsync();

        foreach (var user in users)
        {
            if (user.Id == currentUserId)
            {
                failed.Add(new BulkErrorItem(user.Id, "CannotUpdateSelf"));
            }
            else if (adminUserIds.Contains(user.Id))
            {
                failed.Add(new BulkErrorItem(user.Id, "CannotUpdateAdmin"));
            }
            else
            {
                validUserIds.Add(user.Id);
            }
        }

        if (validUserIds.Any())
        {
            await _userRepository.Table
      .Where(u => validUserIds.Contains(u.Id))
      .Set(u => u.IsActive, isActive)
      .Set(u => u.UpdatedAt, DateTime.UtcNow)
      .UpdateAsync();

        }

        return new BulkOperationResult
        {
            SuccessIds = validUserIds,
            Errors = failed
        };
    }



    public async Task<User> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.EntitySet
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
        if (user == null)
            return null;

        user.Roles = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where ur.UserId == user.Id
            select r
        ).ToListAsync();

        return user;
    }

    public async Task<User> GetUserByUsernameAsync(string username)
    {
        var user = await _userRepository.EntitySet
            .FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);
        if (user == null)
            return null;

        user.Roles = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where ur.UserId == user.Id
            select r
        ).ToListAsync();

        return user;
    }

    public async Task<User> GetUserByEmailAsync(string email)
    {
        var user = await _userRepository.EntitySet
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        if (user == null)
            return null;

        user.Roles = await (
            from ur in _userRoleRepository.EntitySet
            join r in _roleRepository.EntitySet on ur.RoleId equals r.Id
            where ur.UserId == user.Id
            select r
        ).ToListAsync();

        return user;
    }

    public async Task InsertUserAsync(User user)
    {
        ArgumentNullException.ThrowIfNull(user, nameof(user));
        await _userRepository.InsertAsync(user);
    }

    public async Task UpdateUserAsync(User user)
    {
        ArgumentNullException.ThrowIfNull(user, nameof(user));
        await _userRepository.UpdateAsync(user);
    }

    public async Task<List<User>> GetUsersByIdsAsync(List<int> userIds)
    {
        if (userIds == null || userIds.Count == 0)
            return new List<User>();
        return await _userRepository.EntitySet
            .Where(u => userIds.Contains(u.Id) && !u.IsDeleted)
            .ToListAsync();
    }

    #endregion

    #region addresses

    public async Task<List<Address>> GetAddressesByUserIdAsync(int userId)
    {
        return await _addressRepository.EntitySet
          .Where(a => a.UserId == userId)
          .ToListAsync();
    }

    public async Task InsertAddressAsync(Address address)
    {
        ArgumentNullException.ThrowIfNull(address);

        if (address.IsDefault)
        {
            await _addressRepository.EntitySet
                .Where(a => a.UserId == address.UserId && a.IsDefault)
                .Set(a => a.IsDefault, false)
                .UpdateAsync();
        }

        await _addressRepository.InsertAsync(address);
    }

    public async Task UpdateAddressAsync(Address address)
    {
        ArgumentNullException.ThrowIfNull(address);

        if (address.IsDefault)
        {
            await _addressRepository.EntitySet
                .Where(a => a.UserId == address.UserId && a.Id != address.Id && a.IsDefault)
                .Set(a => a.IsDefault, false)
                .UpdateAsync();
        }

        await _addressRepository.UpdateAsync(address);
    }

    public async Task<int> DeleteAddressAsync(Address address)
    {
        ArgumentNullException.ThrowIfNull(address, nameof(address));
        return await _addressRepository.DeleteAsync(address);
    }

    public async Task<Address> GetAddressByAddressIdAsync(int addressId)
    {
        return await _addressRepository.EntitySet
            .FirstOrDefaultAsync(a => a.Id == addressId);
    }
    #endregion


    #region roles

  


    public async Task<IPagedList<Role>> GetAllRolesAsync(string friendlyName = null, 
        string systemName = null,
        bool? isActive = null, 
        bool? isFreeShipping = null,
        bool? isSystemRole = null,
        Expression<Func<Role, object>> orderBy = null,
        bool? orderDesc = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        var query = _roleRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(friendlyName))
            query = query.Where(r => r.FriendlyName.Contains(friendlyName));

        if (!string.IsNullOrWhiteSpace(systemName))
            query = query.Where(r => r.SystemName.Contains(systemName));

        if (isActive.HasValue)
            query = query.Where(r => r.IsActive == isActive.Value);

        if (isFreeShipping.HasValue)
            query = query.Where(r => r.IsFreeShipping == isFreeShipping.Value);

        if (isSystemRole.HasValue)
            query = query.Where(r => r.IsSystemRole == isSystemRole.Value);

        if (orderBy != null)
        {
            query = (orderDesc ?? false)
                ? query.OrderByDescending(orderBy)
                : query.OrderBy(orderBy);
        }

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }




    public async Task<List<Role>> GetRoleByIdsAsync(List<int> roleIds)
    {
        if (roleIds == null || roleIds.Count == 0)
            return new List<Role>();

        return await _roleRepository.EntitySet
            .Where(r => roleIds.Contains(r.Id) && r.IsActive)
            .ToListAsync();
    }

    public async Task<Role> GetRoleByIdAsync(int roleId)
    {
        return await _roleRepository.EntitySet
            .FirstOrDefaultAsync(r => r.Id == roleId);
    }

    public async Task<Role> GetRoleBySystemNameAsync(string systemName)
    {
        ArgumentNullException.ThrowIfNull(systemName, nameof(systemName));
        return await _roleRepository.EntitySet
            .FirstOrDefaultAsync(r => r.SystemName == systemName && r.IsActive);
    }

    public async Task InsertRoleAsync(Role role)
    {
        ArgumentNullException.ThrowIfNull(role, nameof(role));
        await _roleRepository.InsertAsync(role);
    }


    public async Task UpdateRoleAsync(Role role)
    {
        ArgumentNullException.ThrowIfNull(role, nameof(role));
        await _roleRepository.UpdateAsync(role);
    }

    public async Task<int> DeleteRoleAsync(Role role)
    {
        ArgumentNullException.ThrowIfNull(role, nameof(role));
        return await _roleRepository.DeleteAsync(role);
    }

    #endregion


    #region userRole

    public async Task UpdateUserRolesAsync(User user, List<int> newRoleIds)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(newRoleIds);

        var currentRoleIds = await _userRoleRepository.EntitySet
            .Where(ur => ur.UserId == user.Id)
            .Select(ur => ur.RoleId)
            .ToListAsync();

        var roleIdsToAdd = newRoleIds.Except(currentRoleIds).ToList();
        if (roleIdsToAdd.Any())
        {
            var userRolesToInsert = roleIdsToAdd.Select(roleId => new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            }).ToList();

            await _userRoleRepository.InsertAsync(userRolesToInsert);
        }

        var roleIdsToRemove = currentRoleIds.Except(newRoleIds).ToList();
        if (roleIdsToRemove.Any())
        {
            await _userRoleRepository.EntitySet.Where(ur =>
                ur.UserId == user.Id && roleIdsToRemove.Contains(ur.RoleId)).DeleteAsync();
        }
    }





    public async Task<int> InsertUserRolesAsync(List<UserRole> userRoles)
    {
        if (userRoles == null || !userRoles.Any())
        {
            return 0;
        }

        return await _userRoleRepository.InsertAsync(userRoles);
    }


    #endregion




}
