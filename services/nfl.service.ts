import { supabase } from '../supabaseClient';
import { NflRecommendation, NflPlayerProjection } from '../types';

export const nflService = {
    /**
     * Obtiene recomendaciones de NFL incluyendo Injury Impact y Volatility Alerts.
     */
    async fetchRecommendations(limit = 50): Promise<NflRecommendation[]> {
        const { data, error } = await supabase
            .from('nfl_recommendations')
            .select('*')
            .order('analysis_timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [NFL_SERVICE] Error fetching recommendations:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene proyecciones de jugadores para NFL.
     */
    async fetchPlayerProjections(matchId?: string): Promise<NflPlayerProjection[]> {
        let query = supabase.from('nfl_player_projections').select('*').order('passing_yards', { ascending: false });

        if (matchId) {
            query = query.eq('match_id', matchId);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            console.error('❌ [NFL_SERVICE] Error fetching player projections:', error);
            return [];
        }
        return data || [];
    }
};
