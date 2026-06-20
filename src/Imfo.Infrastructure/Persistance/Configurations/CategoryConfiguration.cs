using Imfo.ApplicationCore.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Imfo.Infrastructure.Persistance.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(prop => prop.Id).ValueGeneratedOnAdd();
        builder.HasOne(c => c.User).WithMany(u => u.Categories).HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}