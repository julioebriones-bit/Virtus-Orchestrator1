import { supabase } from '../supabaseClient';
import { LmbAnalysis } from '../types';

export const lmbService = {
    /**
     * Obtiene análisis de Liga Mexicana de Béisbol.
     */
    async fetchAnalysis(limit = 50): Promise<LmbAnalysis[]> {
        const { data, error } = await supabase
            .from('lmb_analysis')
            .select('*')
            .order('match_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('❌ [LMB_SERVICE] Error fetching analysis:', error);
            return [];
        }
        return data || [];
    }
};
