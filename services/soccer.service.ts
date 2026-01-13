import { supabase } from '../supabaseClient';
import { SoccerRecommendation } from '../types';

export const soccerService = {
    /**
     * Obtiene recomendaciones de Fútbol con Atlas Context y Safe Totals.
     */
    async fetchRecommendations(limit = 50): Promise<SoccerRecommendation[]> {
        const { data, error } = await supabase
            .from('soccer_recommendations')
            .select('*')
            .order('analysis_timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [SOCCER_SERVICE] Error fetching recommendations:', error);
            return [];
        }
        return data || [];
    }
};
