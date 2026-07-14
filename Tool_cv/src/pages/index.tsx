import React from 'react';
import { Page, Header, Box, Text } from 'zmp-ui';

const HomePage = () => {
    return (
        <Page className="page">
            <Header title="Thợ Tốt Doitay" showBackIcon={false} />
            <Box className="p-4 flex flex-center flex-col">
                <Text.Title className="text-primary font-bold text-xl">
                    Chào mừng đến Thợ Tốt Doitay!
                </Text.Title>
                <Box className="mt-4 bg-white p-4 rounded-lg shadow-md w-full">
                    <Text className="text-gray-600">
                        Hồ sơ của bạn sẽ hiển thị ở đây.
                    </Text>
                    <button className="mt-4 w-full bg-secondary text-primary font-bold py-2 rounded">
                        Tạo Hồ Sơ Ngay
                    </button>
                </Box>
            </Box>
        </Page>
    );
};

export default HomePage;
