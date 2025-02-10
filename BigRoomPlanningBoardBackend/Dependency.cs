using System.Collections.Generic;

namespace BigRoomPlanningBoardBackend
{
    public class Dependency
    {
        public int DependencyId { get; set; }

        public DependencyIterationType IterationType { get; set; }

        /// <summary>
        /// Ticket that depends on the other ticket. This Ticket must be planned after the other Ticket
        /// </summary>
        public int DependantTicketId { get; set; }

        /// <summary>
        /// Ticket that the other Ticket depends on. This Ticket must be planed first.
        /// </summary>
        public int DependencyTicketId { get; set; }
    }



    public enum DependencyIterationType
    {
        /// <summary>
        /// Indicates that the dependency must be in the same iteration.
        /// </summary>
        MustMatch,
        /// <summary>
        /// Indicates that the dependency can optionally be in the same iteration.
        /// </summary>
        CanMatch,
        /// <summary>
        /// Indicates that the dependency must not be in the same iteration.
        /// </summary>
        CannotMatch
    }
}
