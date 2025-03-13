namespace BigRoomPlanningBoardBackend.Events.Types
{
    public class EditDependencyEvent : Event
    {
        public int DependencyId { get; set; }

        /// <summary>
        /// Indicates whether the associated tickets must be completed within the same sprint.
        /// When set to true, the tickets are required to be resolved together in the same sprint. 
        /// If set to false, the tickets are required to be addressed in different sprints.
        /// </summary>
        public bool InSameSprint { get; set; }

        public override bool Process(BigRoomPlanningContext bigRoomPlanningContext)
        {
            var results = bigRoomPlanningContext.Dependencies.Find(DependencyId);

            if (results == null)
            {
                return false;
            }

            results.InSameSprint = InSameSprint;

            return true;
        }
    }
}
