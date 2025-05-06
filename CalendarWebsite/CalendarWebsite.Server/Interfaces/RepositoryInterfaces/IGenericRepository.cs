using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;

namespace CalendarWebsite.Server.Interfaces.RepositoryInterfaces
{
    public interface IGenericRepository<T> where T : class
    {
        public Task<IEnumerable<T>> GetAllAsync();
        public Task<T> GetByIdAsync<TKey>(TKey id);
        public Task AddAsync(T entity);

        public Task DeleteAsync(T entity);
        public Task UpdateAsync(T entity);


        public Task<List<T>> FindList(
            Expression<Func<T, bool>> predicate,
            Func<IQueryable<T>, IIncludableQueryable<T, Object>>? include = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disableTracking = true
        );

        public Task<List<TResult>> FindListSelect<TResult>(
            Expression<Func<T, bool>> predicate,
            Expression<Func<T, TResult>> selector,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disableTracking = true,
            bool distinct = false);
        public Task<(List<T> Items, int TotalCount)> FindListPagedAsync(
            Expression<Func<T, bool>> predicate,
            int page,
            int pageSize,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disableTracking = true);

        public Task<int> CountAsync(
            Expression<Func<T, bool>> predicate,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            bool disableTracking = true);
    }
}
