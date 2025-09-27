const { create } = require('ipfs-http-client');
const fs = require('fs').promises;
const path = require('path');


class IPFSService {
  constructor() {
    this.ipfsClient = null;
    this.useRealIPFS = process.env.USE_REAL_IPFS === 'true';
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './storage';
    this.initialize();
  }

  async initialize() {
    if (this.useRealIPFS) {
      try {
        const ipfsEndpoint = process.env.IPFS_ENDPOINT || 'http://localhost:5001';
        this.ipfsClient = create({ url: ipfsEndpoint });
        console.log('🌐 Connected to IPFS at:', ipfsEndpoint);
      } catch (error) {
        console.warn('⚠️ Failed to connect to IPFS, falling back to local storage:', error.message);
        this.useRealIPFS = false;
      }
    }

    if (!this.useRealIPFS) {
      // Ensure local storage directory exists
      try {
        await fs.mkdir(this.localStoragePath, { recursive: true });
        console.log('📁 Using local storage at:', this.localStoragePath);
      } catch (error) {
        console.error('❌ Failed to create local storage directory:', error);
      }
    }
  }

 
  async uploadProof(proof) {
    try {
      const proofData = JSON.stringify(proof, null, 2);
      
      if (this.useRealIPFS && this.ipfsClient) {
        return await this.uploadToIPFS(proofData);
      } else {
        return await this.uploadToLocal(proofData);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload proof: ${error.message}`);
    }
  }

  
  async uploadToIPFS(data) {
    try {
      const result = await this.ipfsClient.add(data);
      const hash = result.cid.toString();
      console.log(`📤 Uploaded to IPFS: ${hash}`);
      return hash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }

  async uploadToLocal(data) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `proof-${timestamp}.json`;
      const filepath = path.join(this.localStoragePath, filename);
      
      await fs.writeFile(filepath, data, 'utf8');
      console.log(`📁 Saved locally: ${filepath}`);
      
      // Return a mock IPFS hash format
      return `QmMock${Buffer.from(filepath).toString('hex').substring(0, 40)}`;
    } catch (error) {
      console.error('Local upload error:', error);
      throw error;
    }
  }

  
  async getProof(hash) {
    try {
      if (this.useRealIPFS && this.ipfsClient && hash.startsWith('Qm')) {
        return await this.getFromIPFS(hash);
      } else {
        return await this.getFromLocal(hash);
      }
    } catch (error) {
      console.error('Retrieve error:', error);
      throw new Error(`Failed to retrieve proof: ${error.message}`);
    }
  }

  
  async getFromIPFS(hash) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfsClient.cat(hash)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('IPFS retrieve error:', error);
      throw error;
    }
  }

  async getFromLocal(hash) {
    try {
      // Find file by hash pattern or use direct path
      const files = await fs.readdir(this.localStoragePath);
      const proofFile = files.find(file => file.includes(hash.substring(4)) || file.endsWith('.json'));
      
      if (!proofFile) {
        throw new Error('Proof not found in local storage');
      }
      
      const filepath = path.join(this.localStoragePath, proofFile);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Local retrieve error:', error);
      throw error;
    }
  }


  getStatus() {
    return {
      useRealIPFS: this.useRealIPFS,
      connected: this.ipfsClient !== null,
      storagePath: this.localStoragePath
    };
  }
}

// Create singleton instance
const ipfsService = new IPFSService();

module.exports = ipfsService;
