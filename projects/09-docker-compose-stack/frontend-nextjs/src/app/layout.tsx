import { ReactNode } from 'react';

export const metadata = {
  title: 'Fullstack Prep Microservices',
  description: 'DevOps Docker Compose Stack',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0f172a', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
