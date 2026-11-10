import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedCounselor } from '@/lib/supabase/server';
import { getStudentsAction } from '@/lib/actions/student.actions';
import { extractTextFromPdf } from '@/lib/pdf-parser/extractor';
import { parseGradelinkTranscript } from '@/lib/pdf-parser/gradelink-parser';
import type { ActionResult, StudentRow, TranscriptPreviewDTO } from '@/types/domain.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResult<TranscriptPreviewDTO[]>>> {
  // 1. Authenticate counselor session (Supports Dev Mock Demo Auth)
  const { user } = await getAuthenticatedCounselor();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Counselor authentication required.',
        },
      },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      const singleFile = formData.get('file') as File | null;
      if (singleFile) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILES_PROVIDED',
            message: 'No PDF transcript files received.',
          },
        },
        { status: 400 }
      );
    }

    const previewResults: TranscriptPreviewDTO[] = [];

    // Pre-fetch active students (DB or Demo fallback)
    const studentsRes = await getStudentsAction();
    const dbStudents: StudentRow[] = (studentsRes.success && studentsRes.data) ? studentsRes.data : [];

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractTextFromPdf(buffer);
        const preview = parseGradelinkTranscript(extracted.lines, file.name);

        // Student matching logic (Code first, then English/Korean name)
        if (dbStudents.length > 0) {
          const normExtractedName = preview.extractedStudentName.toLowerCase().replace(/[,_\s]+/g, ' ');
          const matched = dbStudents.find((s: StudentRow) => {
            if (preview.extractedStudentCode && s.student_code.toLowerCase().includes(preview.extractedStudentCode.toLowerCase())) {
              return true;
            }
            if (s.name_en) {
              const normEn = s.name_en.toLowerCase().replace(/[,_\s]+/g, ' ');
              const enTokens = normEn.split(' ');
              if (enTokens.every((tok) => normExtractedName.includes(tok)) || normEn.includes(normExtractedName)) {
                return true;
              }
            }
            if (s.name_ko && normExtractedName.includes(s.name_ko.toLowerCase())) {
              return true;
            }
            return false;
          });

          if (matched) {
            preview.matchedStudentId = matched.id;
            preview.parseStatus = 'READY';
          } else if (preview.parseStatus === 'READY') {
            preview.parseStatus = 'UNMATCHED_STUDENT';
          }
        }

        previewResults.push(preview);
      } catch (fileErr) {
        previewResults.push({
          sourceFileName: file.name,
          matchedStudentId: null,
          extractedStudentCode: null,
          extractedStudentName: 'Unknown',
          parseStatus: 'PARSE_ERROR',
          conflictCourseCount: 0,
          terms: [],
          errorMessage:
            fileErr instanceof Error ? fileErr.message : 'Failed to parse PDF binary.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: previewResults,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PARSING_FAILED',
          message:
            err instanceof Error ? err.message : 'Internal transcript parsing error.',
        },
      },
      { status: 500 }
    );
  }
}
