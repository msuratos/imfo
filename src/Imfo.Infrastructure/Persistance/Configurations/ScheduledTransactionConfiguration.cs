using Imfo.ApplicationCore.Common.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Imfo.Infrastructure.Persistance.Configurations;

public class ScheduledTransactionConfiguration : IEntityTypeConfiguration<ScheduledTransaction>
{
    public void Configure(EntityTypeBuilder<ScheduledTransaction> builder)
    {
        builder.HasKey(st => st.Id);
        builder.Property(prop => prop.Id).ValueGeneratedOnAdd();
    }
}
