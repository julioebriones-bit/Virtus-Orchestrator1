import { supabase } from '../supabaseClient';
import { MlbRecommendation, MlbPlayerProjection } from '../types';

export const mlbService = {
    /**
     * Obtiene recomendaciones de MLB con Pitcher Matchups y Weather Impact.
     */
    async fetchRecommendations(limit = 50): Promise<MlbRecommendation[]> {
        const { data, error } = await supabase
            .from('mlb_recommendations')
            .select('*')
            .order('analysis_timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [MLB_SERVICE] Error fetching recommendations:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene proyecciones de jugadores para MLB.
     */
    async fetchPlayerProjections(matchId?: string): Promise<MlbPlayerProjection[]> {
        let query = supabase.from('mlb_player_projections').select('*').order('created_at', { ascending: false });

        if (matchId) {
            query = query.eq('match_id', matchId);
        }

        const { data, error } = await query.limit(50);

        if (error) {
            console.error('❌ [MLB_SERVICE] Error fetching player projections:', error);
            return [];
        }
        return data || [];
    }
};
