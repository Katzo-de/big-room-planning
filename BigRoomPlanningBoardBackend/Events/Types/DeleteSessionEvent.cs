namespace BigRoomPlanningBoardBackend.Events.Types
{
    public class DeleteSessionEvent : Event
    {
        public string DeleteSessionId { get; set; }

        public override bool Process(BigRoomPlanningContext bigRoomPlanningContext)
        {
            var session = bigRoomPlanningContext.Sessions.Find(SessionId);
            if (session != null)
            {
                return false;
            }

            bigRoomPlanningContext.Remove(session);

            return true;
        }
    }
}
