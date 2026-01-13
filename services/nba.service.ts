import { supabase } from '../supabaseClient';
import { NbaRecommendation } from '../types';

export const nbaService = {
    /**
     * Obtiene recomendaciones específicas de NBA con campos avanzados (Titanium Score, Hook Protection).
     */
    async fetchRecommendations(limit = 50): Promise<NbaRecommendation[]> {
        const { data, error } = await supabase
            .from('nba_recommendations')
            .select('*')
            .order('analysis_timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [NBA_SERVICE] Error fetching recommendations:', error);
            return [];
        }
        return data || [];
    }
};
