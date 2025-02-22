import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export async function POST(request) {
  try {
    const { path: filePath, content } = await request.json();

    // Sanitize and validate the file path
    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Ensure we're writing within the project directory
    const fullPath = process.cwd() + '/' + filePath;
    
    try {
      // Create directory recursively
      await mkdir(dirname(fullPath), { recursive: true });
      
      // Write the file
      await writeFile(fullPath, content);

      return NextResponse.json({ success: true });
    } catch (fsError) {
      console.error('File system error:', fsError);
      return NextResponse.json(
        { error: 'Failed to write file', details: fsError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}