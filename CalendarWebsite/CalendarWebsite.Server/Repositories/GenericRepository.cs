using System.Linq.Expressions;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace CalendarWebsite.Server.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly UserDataContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(UserDataContext context)
        {
            this._context = context;
            this._dbSet = context.Set<T>();
        }

        public virtual async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task<List<T>> FindList(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true)
        {
            if (predicate == null)
            {
                throw new ArgumentNullException(nameof(predicate));
            }

            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                query = include(query);
            }

            //predicate (hàm where)
            query = query.Where(predicate);

            if (orderBy != null)
            {
                query = orderBy(query);
            }
            return await query.ToListAsync();
        }

        public virtual async Task<List<TResult>> FindListSelect<TResult>(
            Expression<Func<T, bool>> predicate, 
            Expression<Func<T, TResult>> selector, 
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, 
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
            bool disableTracking = true, 
            bool distinct = false)
        {
            if (predicate == null)
            {
                throw new ArgumentNullException(nameof(predicate));
            }

            if (selector == null)
            {
                throw new ArgumentNullException(nameof(selector));
            }

            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                query = include(query);
            }

            query = query.Where(predicate);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            IQueryable<TResult> resultQuery = query.Select(selector);

            if (distinct)
            {
                resultQuery = resultQuery.Distinct();
            }

            return await resultQuery.ToListAsync();
        }
        public virtual async Task<(List<T> Items, int TotalCount)> FindListPagedAsync(
            Expression<Func<T, bool>> predicate,
            int page,
            int pageSize,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disableTracking = true)
        {
            if (predicate == null)
            {
                throw new ArgumentNullException(nameof(predicate));
            }

            if (page < 0)
            {
                throw new ArgumentException("Page must be greater than or equal to 0.", nameof(page));
            }

            if (pageSize <= 0)
            {
                throw new ArgumentException("PageSize must be greater than 0.", nameof(pageSize));
            }

            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                query = include(query);
            }

            query = query.Where(predicate);

            // Tính tổng số bản ghi cho data grid
            int totalCount = await query.CountAsync();

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Phân trang
            query = query.Skip(page * pageSize).Take(pageSize);

            var items = await query.ToListAsync();

            return (items, totalCount);
        }
        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<T> GetByIdAsync<TKey>(TKey id)
        {

            return await _dbSet.FindAsync(id);
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync(); ;
        }
    }
}
