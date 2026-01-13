import { supabase } from '../supabaseClient';
import { NflRecommendation } from '../types';

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
    }
};
