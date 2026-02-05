import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">ミーティング調整アプリ</h1>
                    <p className="py-6">
                        簡単な操作で、みんなの空き時間を調整し、最適なミーティング時間を見つけましょう。
                    </p>
                    <Link to="/create" className="btn btn-primary">
                        イベントを作成
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
