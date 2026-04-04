using Microsoft.EntityFrameworkCore;

namespace KeyVault.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options);