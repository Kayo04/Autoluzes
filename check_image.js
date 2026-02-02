const { MongoClient } = require('mongodb');

async function checkLatestReport() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
      console.log('No MONGODB_URI found');
      return;
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    const latestReport = await db.collection('reports').find().sort({ createdAt: -1 }).limit(1).toArray();
    
    if (latestReport.length > 0) {
        const report = latestReport[0];
        console.log('Latest Report ID:', report._id);
        console.log('Image ID:', report.imageId);
        console.log('Photo ID (old):', report.photoId);
        
        if (report.imageId) {
            // Check if file exists in gridfs
            const files = await db.collection('report_images.files').find({ _id: report.imageId }).toArray();
            console.log('GridFS File found:', files.length > 0);
            if (files.length > 0) {
                console.log('File contentType:', files[0].contentType);
                console.log('File length:', files[0].length);
                console.log('File filename:', files[0].filename);
                console.log('TEST URL: http://localhost:3000/api/images/' + report.imageId);
                
                // Fetch the image to see if it works
                try {
                    const response = await fetch('http://localhost:3000/api/images/' + report.imageId);
                    console.log('Image Fetch Status:', response.status);
                    console.log('Image Content-Type:', response.headers.get('content-type'));
                    console.log('Image Content-Length:', response.headers.get('content-length'));
                } catch (err) {
                    console.log('Fetch Error:', err.message);
                }
            }
        }
    } else {
        console.log('No reports found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkLatestReport();
