using Backend.Common;
using System.Linq.Expressions;
using Backend.Data;
using Backend.Data.Domain.Authors;
using Backend.Data.Domain.Products;
using LinqToDB;

namespace Backend.Services.Authors;

public class AuthorService : IAuthorService
{

    private readonly IRepository<Author> _authorRepository;

    private readonly IRepository<BookAuthor> _bookAuthorRepository;


    public AuthorService(IRepository<Author> authorRepository, IRepository<BookAuthor> bookAuthorRepository)
    {
        _authorRepository = authorRepository ?? throw new ArgumentNullException(nameof(authorRepository), "Author repository is not initialized.");
        _bookAuthorRepository = bookAuthorRepository ?? throw new ArgumentNullException(nameof(bookAuthorRepository), "Book author repository is not initialized.");
    }
    public async Task<List<Author>> GetAllAuthorsAsync()
    {
        return await _authorRepository.EntitySet.ToListAsync();

    }

    public async Task<List<Author>> GetAuthorsForHomePageAsync(int pageIndex = 0, int pageSize = int.MaxValue)
    {

        return await _authorRepository.EntitySet.Where(a => a.IsShownOnHomePage)
            .OrderBy(a => a.DisplayOrder)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetBookCountOfAuthorAsync(int authorId)
    {
        return await _bookAuthorRepository.EntitySet.CountAsync(ba => ba.AuthorId == authorId);
    }

    public async Task<Author> GetByIdAsync(int id)
    {
        var author = await _authorRepository.EntitySet
            .FirstOrDefaultAsync(a => a.Id == id);
        return author;
    }

    public async Task CreateAsync(Author author)
    {
        await _authorRepository.InsertAsync(author);
    }

    public async Task UpdateAsync(int id, Author author)
    {



        await _authorRepository.UpdateAsync(author);
    }

    public async Task DeleteAsync(int id)
    {
        var author = await _authorRepository.EntitySet
            .FirstOrDefaultAsync(a => a.Id == id);

        await _authorRepository.DeleteAsync(author);
    }

    public async Task<IPagedList<Author>> GetAllAsync(string keyword = null,
        int pageIndex = 0,
        int pageSize = int.MaxValue)
    {
        var query = _authorRepository.EntitySet;

        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(a => a.Name.Contains(keyword));

        query = query.OrderByDescending(a => a.UpdatedAt); ;

        return await query.ToPagedListAsync(pageIndex, pageSize);
    }
}
