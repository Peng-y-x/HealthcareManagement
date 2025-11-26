import "./Pagination.css"

export default function Pagination({page, totalPage, onPageChange}) {
    const pages = getPageNumbers(page, totalPage);
    return (
        <div className="pagination">
            {
                pages.map((item, index) =>
                item === "..." 
                    ? (
                        <span key={index} className="dots">...</span>
                    )
                    : (
                        <button 
                            key={index} 
                            className={`page-btn ${item === page ? "active" : ""}`}
                            onClick={() => onPageChange(item)}>
                            {item}
                        </button>
                    )
                )
            }
        </div>
    );
}

function getPageNumbers(current, total) {
    const pages = [];
    if (total < 8){
        for (let i = 1; i <= total; i++){
            pages.push(i);
        }
        return pages;
    }
    pages.push(1, 2);
    if(current > 4) pages.push("...");
    const st = Math.max(3, current - 1);
    const ed = Math.min(total - 2, current + 1);
    for(let i = st; i <= ed; i++){
        pages.push(i);
    }
    pages.push(total - 1, total);
    return pages;
}