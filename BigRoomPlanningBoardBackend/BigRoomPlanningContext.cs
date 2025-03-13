﻿using BigRoomPlanningBoardBackend.Events;
using BigRoomPlanningBoardBackend.Events.Types;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver.Core.Configuration;
using MongoDB.Driver;
using System;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace BigRoomPlanningBoardBackend
{
    public class BigRoomPlanningContext : DbContext
    {
        private readonly IOptions<ApiSettings> apiSettingsOptions;

        public DbSet<Squad> Squads { get; set; }
        public DbSet<PlannedPeriod> PlannedPeriods { get; set; }
        public DbSet<Dependency> Dependencies { get; set; }
        public DbSet<DependencyBoard> DependencyBoards { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<SquadSprintStats> SquadSprintStats { get; set; }
        public DbSet<Risk> Risks { get; set; }


        public DbSet<Event> Events { get; set; }

        #region Event Types

        public DbSet<AddDependencyEvent> AddDependencyEvents { get; set; }
        public DbSet<AddOrUpdateSquadSprintStatsEvent> AddOrUpdateSquadSprintStatsEvents { get; set; }
        public DbSet<AddPlannedPeriodEvent> AddPlannedPeriodEvents { get; set; }
        public DbSet<AddRiskEvent> AddRiskEvents { get; set; }
        public DbSet<AddSessionEvent> AddSessionEvents { get; set; }
        public DbSet<AddSprintEvent> AddSprintEvents { get; set; }
        public DbSet<AddSquadEvent> AddSquadEvents { get; set; }
        public DbSet<AddTicketEvent> AddTicketEvents { get; set; }
        public DbSet<DeleteDependencyEvent> DeleteDependencyEvents { get; set; }
        public DbSet<DeleteRiskEvent> DeleteRiskEvents { get; set; }
        public DbSet<DeleteSessionEvent> DeleteSessionEvents { get; set; }
        public DbSet<DeleteTicketEvent> DeleteTicketEvents { get; set; }
        public DbSet<EditPlannedPeriodEvent> EditPlannedPeriodEvents { get; set; }
        public DbSet<EditDependencyEvent> EditDependencyEvents { get; set; }
        public DbSet<EditRiskEvent> EditRiskEvents { get; set; }
        public DbSet<EditSprintEvent> EditSprintEvents { get; set; }
        public DbSet<EditSquadEvent> EditSquadEvents { get; set; }
        public DbSet<EditTicketEvent> EditTicketEvents { get; set; }


        #endregion


        public BigRoomPlanningContext(IOptions<ApiSettings> apiSettingsOptions)
        {
            this.apiSettingsOptions = apiSettingsOptions;

            
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            switch (apiSettingsOptions.Value.DataBaseProvider)
            {
                case DataBaseProvider.Sqlite:
                    if (!string.IsNullOrWhiteSpace(apiSettingsOptions.Value.DbPath))
                    {
                        options.UseSqlite($"Data Source={apiSettingsOptions.Value.DbPath}");
                    }
                    else
                    {
                        options.UseSqlite(apiSettingsOptions.Value.ConnectionString);
                    }
                    break;
                case DataBaseProvider.MongoDB:
                    var client = new MongoClient(apiSettingsOptions.Value.ConnectionString);
                    var databaseName = MongoUrl.Create(apiSettingsOptions.Value.ConnectionString).DatabaseName;

                    options.UseMongoDB(client, databaseName);
                    break;
                case DataBaseProvider.Postgress:
                    options.UseNpgsql(apiSettingsOptions.Value.ConnectionString);
                    break;
                default:
                    throw new Exception("Unknown DataBaseProvider: " +  apiSettingsOptions.Value.DbPath);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Make sure DAtes are deserialized with te correct time
            // https://stackoverflow.com/a/61243301
            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                v => v.ToUniversalTime(),
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );

            var nullableDateTimeConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v.HasValue ? v.Value.ToUniversalTime() : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
             );

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (entityType.IsKeyless)
                {
                    continue;
                }

                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(dateTimeConverter);
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(nullableDateTimeConverter);
                    }
                }
            }
        }
    }
}
