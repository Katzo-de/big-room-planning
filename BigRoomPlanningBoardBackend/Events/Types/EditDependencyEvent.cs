namespace BigRoomPlanningBoardBackend.Events.Types
{
    public class EditDependencyEvent : Event
    {
        public int DependencyId { get; set; }

        public DependencyIterationType IterationType { get; set; }

        public override bool Process(BigRoomPlanningContext bigRoomPlanningContext)
        {
            var results = bigRoomPlanningContext.Dependencies.Find(DependencyId);

            if (results == null)
            {
                return false;
            }

            results.IterationType = IterationType;

            return true;
        }
    }
}
