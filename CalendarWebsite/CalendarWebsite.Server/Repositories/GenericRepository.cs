using System.Linq.Expressions;
using CalendarWebsite.Server.Data;
using CalendarWebsite.Server.Interfaces.RepositoryInterfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Newtonsoft.Json;

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

        public virtual async Task<T> AddAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await _context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi thêm entity: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
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

        public virtual async Task<IEnumerable<T>> GetTop100()
        {
            return await _dbSet.Take(100).ToListAsync();
        }

        public virtual async Task<T> GetByIdAsync<TKey>(TKey id)
        {

            return await _dbSet.FindAsync(id);
        }

        public virtual async Task UpdateAsync(T entity)
        {
            try
            {
                // Tìm khóa chính của entity
                var keyProperties = _context.Model.FindEntityType(typeof(T)).FindPrimaryKey().Properties;
                var keyValues = new List<object>();
                
                foreach (var property in keyProperties)
                {
                    var value = entity.GetType().GetProperty(property.Name).GetValue(entity);
                    keyValues.Add(value);
                }
                
                // Tìm entity hiện tại trong context (nếu có)
                var existingEntity = _dbSet.Find(keyValues.ToArray());
                
                if (existingEntity != null)
                {
                    // Tách entity hiện tại
                    _context.Entry(existingEntity).State = EntityState.Detached;
                }
                
                // Đánh dấu entity mới là Modified
                _dbSet.Attach(entity);
                _context.Entry(entity).State = EntityState.Modified;
                
                // Lưu thay đổi
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi cập nhật entity: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }

        public virtual async Task<int> CountAsync(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
        bool disableTracking = true)
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

            query = query.Where(predicate);

            return await query.CountAsync();
        }
        public async Task<T?> FindOne(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        string includeProperties = "",
        bool disableTracking = false)
        {
            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            foreach (var includeProperty in includeProperties.Split
                (new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            query = query.Where(predicate);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.FirstOrDefaultAsync();
        }

        public virtual async Task<TResult?> FindOneSelect<TResult>(
            Expression<Func<T, bool>> predicate,
            Expression<Func<T, TResult>> selector,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            string includeProperties = "",
            bool disableTracking = false)
        {
            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            foreach (var includeProperty in includeProperties.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            query = query.Where(predicate);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query.Select(selector).FirstOrDefaultAsync();
        }

        public Task DeleteAsyncByKey<TKey>(TKey id)
        {
            var entity = _dbSet.Find(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                return _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Entity not found");
            }
        }
    }
}
