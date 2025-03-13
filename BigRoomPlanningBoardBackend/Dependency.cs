using System.Collections.Generic;

namespace BigRoomPlanningBoardBackend
{
    public class Dependency
    {
        public int DependencyId { get; set; }

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
    }
}
