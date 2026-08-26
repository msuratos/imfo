using Imfo.ApplicationCore.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Imfo.Infrastructure.Persistance.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(prop => prop.Id).ValueGeneratedOnAdd();
        builder.Property(prop => prop.ExternalId).IsRequired().HasMaxLength(100);
        builder.Property(prop => prop.Name).IsRequired().HasMaxLength(100);
        builder.Property(prop => prop.UserName).IsRequired().HasMaxLength(100);

        builder.HasMany(u => u.Budgets).WithOne(b => b.User).HasForeignKey(b => b.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(u => u.Goals).WithOne(g => g.User).HasForeignKey(g => g.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(u => u.ScheduledTransactions).WithOne(i => i.User).HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(u => u.Transactions).WithOne(t => t.User).HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}