import { useState, useEffect } from "react";

import "./Physicians.css"
import PhysicianCard from "../../components/PhysicianCard/PhysicianCard"
import Pagination from "../../components/Pagination/Pagination";

export default function Physicians() {
    // Read URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get('page')) || 1;
    const pageSize = parseInt(urlParams.get('page_size')) || 10;

    const [page, setPage] = useState(initialPage);
    const [totalPage, setTotalPage] = useState(1);
    const [phyList, setPhyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPhysicians = async (pageNumber) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/physicians?page=${pageNumber}&page_size=${pageSize}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch physicians');
            }

            const data = await response.json();

            if (data.success) {
                setPhyList(data.data);
                setTotalPage(data.total_pages);
                setPage(data.page);
            } else {
                setError(data.error || 'Failed to load physicians');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhysicians(page);
    }, [page]);

    function handlePageChange(newPage) {
        setPage(newPage);
    }

    if (loading) {
        return (
            <div className="physicians-page">
                <div className="loading-message">Loading physicians...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="physicians-page">
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    const phyCards = phyList.map((phy, index) => (
        <PhysicianCard
            key={phy.PhysicianID || index}
            name={phy.Name}
            dept={phy.Department}
            clinic={phy.clinic || 'N/A'}
            cl_address={phy.cl_address || 'N/A'}
        />
    ));

    return (
        <div className="physicians-page">
            <div className="physicians-table">
                {phyList.length > 0 ? phyCards : <div>No physicians found</div>}
            </div>
            <div>
                <Pagination page={page} totalPage={totalPage} onPageChange={handlePageChange}></Pagination>
            </div>
        </div>
    );
}