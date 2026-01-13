import { supabase } from '../supabaseClient';
import { MlbRecommendation } from '../types';

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
    }
};
