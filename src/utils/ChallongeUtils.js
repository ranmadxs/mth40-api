module.exports = {
    formatTournament : (rawData) => {
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
    },
    formatMatch : (rawData, player1, player2) => {
        const matchNumber = rawData.suggested_play_order;
        const groupName = rawData.group_id != null ? "[" + rawData.group_name + "]  " : "";
        const matchName = groupName + matchNumber + ') ' + player1.name + " VS " + player2.name;
        var match = {
            id: rawData.id,
            name: matchName,
            state: rawData.state,
            tournament: {
                id: rawData.tournament_id
            },
            players: {
                player1: player1,
                player2: player2,
            },
            results: {
                winner_id: rawData.winner_id,
                loser_id: rawData.loser_id,
                scores: rawData.scores_csv,
            },
            created_at: rawData.created_at,
            round: rawData.round,
            group_id: rawData.group_id,
            matchNumber: rawData.suggested_play_order,
            matchIdentifier: rawData.identifier,        
        };
        return match;
    },
    formatParticipant: (rawData) => {
        var participant = {
            id: rawData.id,
            name: rawData.name,
            seed: rawData.seed,
            created_at: rawData.created_at,
            final_rank: rawData.final_rank,
            tournament_id: rawData.tournament_id,            
        };
        return participant;
    }
};