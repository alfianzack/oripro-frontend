import React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { House } from 'lucide-react';


interface BreadcrumbData {
    text: string
}

const DetailBreadcrumb = ({ text }: BreadcrumbData) => {
    return (
        <div className='flex flex-wrap items-center justify-between gap-2 mb-6'>
            <h6 className="text-2xl font-semibold">{text}</h6>
        </div>
    );
};

export default DetailBreadcrumb;