import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEnvironment } from './utils/environment.js';

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendDirectory, '.env') });

const startServer = async () => {
    validateEnvironment();

    const [{ default: connectDB }, { default: app }] = await Promise.all([
        import('./db/index.js'),
        import('./app.js'),
    ]);

    await connectDB();
    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
};

startServer().catch((error) => {
    console.error(`Backend startup failed: ${error.message}`);
    process.exit(1);
});
