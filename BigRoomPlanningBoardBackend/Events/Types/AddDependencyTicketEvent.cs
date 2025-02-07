using System;
using System.Linq;
using System.Net.Sockets;

namespace BigRoomPlanningBoardBackend.Events.Types
{
    public class AddDependencyTicketEvent : Event
    {
        #region Ticket
        /// <summary>
        /// This will be set after the event is processed
        /// </summary>
        public int? TicketId { get; set; }

        public int SquadId { get; set; }

        public int PlannedPeriodId { get; set; }

        public int? SprintId { get; set; }

        public string Title { get; set; }

        public int ColumnOrder { get; set; }

        public int? PredecessorId { get; set; }
        #endregion

        #region dependency
        /// <summary>
        /// Will be filled after the event is processed
        /// </summary>
        public int? DependencyId { get; set; }

        /// <summary>
        /// Ticket that depends on the other ticket. This Ticket must be planned after the other Ticket
        /// </summary>
        public int? DependantTicketId { get; set; }

        /// <summary>
        /// Ticket that the other Ticket depends on. This Ticket must be planed first.
        /// </summary>
        public int? DependencyTicketId { get; set; }
        #endregion

        public override bool Process(BigRoomPlanningContext bigRoomPlanningContext)
        {

            #region check requirements
            if (DependantTicketId == null && DependencyTicketId == null || string.IsNullOrWhiteSpace(Title)) 
            {
                return false;
            }

            var squad = bigRoomPlanningContext.Squads.Find(SquadId);
            var plannedPeriod = bigRoomPlanningContext.PlannedPeriods.Find(PlannedPeriodId);
            var existing = bigRoomPlanningContext.Dependencies.FirstOrDefault(x => x.DependantTicketId == DependantTicketId && x.DependencyTicketId == DependencyId);

            if (squad == null || plannedPeriod == null || existing != null)
            {
                return false;
            }
            #endregion

            var ticket = new Ticket
            {
                PlannedPeriodId = PlannedPeriodId,
                SprintId = SprintId,
                SquadId = SquadId,
                Title = Title,
                ColumnOrder = ColumnOrder
            };

            bigRoomPlanningContext.Add(ticket);

            if (!ticket.SprintId.HasValue)
            {
                var relevantTickets = bigRoomPlanningContext.Tickets.Where(x => x.SprintId == null && x.PlannedPeriodId == ticket.PlannedPeriodId && x.SquadId == ticket.SquadId).OrderBy(x => x.ColumnOrder).ToList();

                for (int i = 0; i < relevantTickets.Count; i++)
                {
                    relevantTickets[i].ColumnOrder = relevantTickets[i].ColumnOrder + 1;
                }
            }

            bigRoomPlanningContext.SaveChanges();
            TicketId = ticket.TicketId;


            var dependency = new Dependency
            {
                DependencyTicketId = DependencyTicketId ?? ticket.TicketId,
                DependantTicketId = DependantTicketId ?? ticket.TicketId,
            };

            bigRoomPlanningContext.Add(dependency);
            bigRoomPlanningContext.SaveChanges();

            DependencyId = dependency.DependencyId;
            DependantTicketId = dependency.DependantTicketId;
            DependencyTicketId = dependency.DependencyTicketId;

            return true;
        }
    }
}
