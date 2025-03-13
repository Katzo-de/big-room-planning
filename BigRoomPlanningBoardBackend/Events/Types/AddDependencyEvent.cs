using System.Linq;

namespace BigRoomPlanningBoardBackend.Events.Types
{
    public class AddDependencyEvent : Event
    {
        /// <summary>
        /// Will be filled after the event is processed
        /// </summary>
        public int? DependencyId { get; set; }

        /// <summary>
        /// Indicates whether the associated tickets must be completed within the same sprint.
        /// When set to true, the tickets are required to be resolved together in the same sprint. 
        /// If set to false, the tickets are required to be addressed in different sprints.
        /// </summary>
        public bool InSameSprint { get; set; }

        /// <summary>
        /// Ticket that depends on the other ticket. This Ticket must be planned after the other Ticket
        /// </summary>
        public int DependantTicketId { get; set; }

        /// <summary>
        /// Ticket that the other Ticket depends on. This Ticket must be planed first.
        /// </summary>
        public int DependencyTicketId { get; set; }

        public override bool Process(BigRoomPlanningContext bigRoomPlanningContext)
        {
            var existing = bigRoomPlanningContext.Dependencies.FirstOrDefault(x =>
                x.DependantTicketId == DependantTicketId
                && x.DependencyTicketId == DependencyId
            );

            if (existing != null)
            {
                return false;
            }

            var dependency = new Dependency
            {
                DependencyTicketId = DependencyTicketId,
                DependantTicketId = DependantTicketId,
                InSameSprint = InSameSprint,
            };

            bigRoomPlanningContext.Dependencies.Add(dependency);
            bigRoomPlanningContext.SaveChanges();

            DependencyId = dependency.DependencyId;

            return true;
        }
    }
}
