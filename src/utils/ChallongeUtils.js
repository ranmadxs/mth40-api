module.exports = {
    formatTournamet : (rawData) => {
        let tournament = {
            id: rawData.id,
            name: rawData.name,
            url: rawData.full_challonge_url,
            tournament_type: rawData.tournament_type,
            game_name: rawData.game_name,
            state: rawData.state,
            event_id: rawData.event_id,
            created_at: rawData.created_at,
            started_at: rawData.started_at,
            completed_at: rawData.completed_at,
            game_id: rawData.game_id,
            game_name: rawData.game_name,
            participants_count: rawData.participants_count,
            progress_meter: rawData.progress_meter,
        };
        return tournament;


    }
};