export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TestTypeEnum = 'TOEFL' | 'SAT' | 'PSAT' | 'AP';
export type AwardScopeEnum = 'INTERNAL' | 'EXTERNAL';
export type ProposerTypeEnum = 'TEACHER' | 'STUDENT' | 'BOTH';

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          student_code: string;
          name_ko: string;
          name_en: string | null;
          grade_level: number;
          enrollment_year: number | null;
          expected_graduation_year: number | null;
          email: string | null;
          cumulative_gpa_unweighted: number | null;
          cumulative_gpa_weighted: number | null;
          basic_memo: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_code: string;
          name_ko: string;
          name_en?: string | null;
          grade_level: number;
          enrollment_year?: number | null;
          expected_graduation_year?: number | null;
          email?: string | null;
          cumulative_gpa_unweighted?: number | null;
          cumulative_gpa_weighted?: number | null;
          basic_memo?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_code?: string;
          name_ko?: string;
          name_en?: string | null;
          grade_level?: number;
          enrollment_year?: number | null;
          expected_graduation_year?: number | null;
          email?: string | null;
          cumulative_gpa_unweighted?: number | null;
          cumulative_gpa_weighted?: number | null;
          basic_memo?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academic_terms: {
        Row: {
          id: string;
          student_id: string;
          academic_year: string;
          semester: string;
          grade_level_at_term: number | null;
          term_gpa_unweighted: number | null;
          term_gpa_weighted: number | null;
          total_credits: number | null;
          is_manual_override: boolean;
          override_reason: string | null;
          source_pdf_filename: string | null;
          last_parsed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          academic_year: string;
          semester: string;
          grade_level_at_term?: number | null;
          term_gpa_unweighted?: number | null;
          term_gpa_weighted?: number | null;
          total_credits?: number | null;
          is_manual_override?: boolean;
          override_reason?: string | null;
          source_pdf_filename?: string | null;
          last_parsed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          academic_year?: string;
          semester?: string;
          grade_level_at_term?: number | null;
          term_gpa_unweighted?: number | null;
          term_gpa_weighted?: number | null;
          total_credits?: number | null;
          is_manual_override?: boolean;
          override_reason?: string | null;
          source_pdf_filename?: string | null;
          last_parsed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_grades: {
        Row: {
          id: string;
          term_id: string;
          student_id: string;
          course_code: string | null;
          course_name: string;
          credits: number;
          letter_grade: string;
          grade_points: number | null;
          is_honors_or_ap: boolean;
          is_credit_makeup: boolean;
          original_letter_grade: string | null;
          original_grade_points: number | null;
          makeup_date: string | null;
          makeup_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term_id: string;
          student_id: string;
          course_code?: string | null;
          course_name: string;
          credits?: number;
          letter_grade: string;
          grade_points?: number | null;
          is_honors_or_ap?: boolean;
          is_credit_makeup?: boolean;
          original_letter_grade?: string | null;
          original_grade_points?: number | null;
          makeup_date?: string | null;
          makeup_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          term_id?: string;
          student_id?: string;
          course_code?: string | null;
          course_name?: string;
          credits?: number;
          letter_grade?: string;
          grade_points?: number | null;
          is_honors_or_ap?: boolean;
          is_credit_makeup?: boolean;
          original_letter_grade?: string | null;
          original_grade_points?: number | null;
          makeup_date?: string | null;
          makeup_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      test_scores: {
        Row: {
          id: string;
          student_id: string;
          test_type: TestTypeEnum;
          subject_or_detail: string | null;
          test_date: string | null;
          total_score: string;
          section_scores: Json;
          detailed_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          test_type: TestTypeEnum;
          subject_or_detail?: string | null;
          test_date?: string | null;
          total_score: string;
          section_scores?: Json;
          detailed_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          test_type?: TestTypeEnum;
          subject_or_detail?: string | null;
          test_date?: string | null;
          total_score?: string;
          section_scores?: Json;
          detailed_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_clubs: {
        Row: {
          id: string;
          student_id: string;
          club_name: string;
          active_grades: string | null;
          role_title: string | null;
          activity_period: string | null;
          detailed_description: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          club_name: string;
          active_grades?: string | null;
          role_title?: string | null;
          activity_period?: string | null;
          detailed_description: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          club_name?: string;
          active_grades?: string | null;
          role_title?: string | null;
          activity_period?: string | null;
          detailed_description?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      student_awards: {
        Row: {
          id: string;
          student_id: string;
          award_title: string;
          award_scope: AwardScopeEnum;
          award_rank: string | null;
          award_date: string | null;
          grade_level_at_award: number | null;
          issuing_organization: string | null;
          detailed_description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          award_title: string;
          award_scope?: AwardScopeEnum;
          award_rank?: string | null;
          award_date?: string | null;
          grade_level_at_award?: number | null;
          issuing_organization?: string | null;
          detailed_description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          award_title?: string;
          award_scope?: AwardScopeEnum;
          award_rank?: string | null;
          award_date?: string | null;
          grade_level_at_award?: number | null;
          issuing_organization?: string | null;
          detailed_description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      counseling_logs: {
        Row: {
          id: string;
          student_id: string;
          counselor_id: string | null;
          counselor_name: string;
          counseling_date: string;
          session_topic: string;
          content: string;
          action_items: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          counselor_id?: string | null;
          counselor_name?: string;
          counseling_date?: string;
          session_topic: string;
          content: string;
          action_items?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          counselor_id?: string | null;
          counselor_name?: string;
          counseling_date?: string;
          session_topic?: string;
          content?: string;
          action_items?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      target_universities: {
        Row: {
          id: string;
          student_id: string;
          university_name: string;
          country_or_region: string | null;
          intended_major: string | null;
          proposer_type: ProposerTypeEnum;
          application_round: string | null;
          pros: string | null;
          cons: string | null;
          strategic_notes: string | null;
          priority_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          university_name: string;
          country_or_region?: string | null;
          intended_major?: string | null;
          proposer_type: ProposerTypeEnum;
          application_round?: string | null;
          pros?: string | null;
          cons?: string | null;
          strategic_notes?: string | null;
          priority_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          university_name?: string;
          country_or_region?: string | null;
          intended_major?: string | null;
          proposer_type?: ProposerTypeEnum;
          application_round?: string | null;
          pros?: string | null;
          cons?: string | null;
          strategic_notes?: string | null;
          priority_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      test_type_enum: TestTypeEnum;
      award_scope_enum: AwardScopeEnum;
      proposer_type_enum: ProposerTypeEnum;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
