import Sidebar from '../../components/Sidebar';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="h-screen flex">
            <Sidebar />
            <div className='w-4/5'>
                {children}  
            </div>
        </div>
    );
}