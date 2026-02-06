import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-4xl font-bold">ミーティング調整アプリ</h1>
                    <p className="py-6">
                        最適なミーティング時間を見つけましょう。
                    </p>
                    <Link to="/create" className="btn btn-primary">
                        予定を作成
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
