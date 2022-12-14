import React, { useEffect, useState } from "react";
import {
    Card,
    Typography,
    Button,
    Space,
    Table,
    Tag,
    Popconfirm,
    message,
    Modal,
    Form,
    Checkbox,
    notification,
    Skeleton,
    Result,
} from "antd";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";

export default function AdminPage() {
    const { Title } = Typography;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [focusedAcc, setFocusedAcc] = useState({});
    const [checkedList, setCheckedList] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState(false);
    const { user } = useAuthContext();
    const CheckboxGroup = Checkbox.Group;

    const handleConfirm = async (id) => {
        try {
            await axios.delete(
                `https://bloodio-api.vercel.app/api/user/${id}`,
                {
                    headers: {
                        "x-access-token": `${user.accessToken}`,
                    },
                }
            );

            message.success("Data berhasil dihapus!");
            getAccounts();
        } catch (error) {
            message.error("Data gagal dihapus.");
        }
    };

    const handleOkModal = () => {
        setIsModalOpen(false);
    };

    const handleCancelModal = () => {
        setIsModalOpen(false);
    };

    const handleModalOpen = (record) => {
        setFocusedAcc(record);
        setCheckedList(record.roles);
        setIsModalOpen(true);
    };

    const options = [
        { label: "User", value: "user", disabled: true },
        { label: "Admin", value: "admin" },
        { label: "Moderator", value: "moderator" },
    ];

    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            render: (text) => <span>{text}</span>,
        },
        {
            title: "Roles",
            key: "roles",
            dataIndex: "roles",
            filters: [
                {
                    text: "Moderator",
                    value: "moderator",
                },
                {
                    text: "Admin",
                    value: "admin",
                },
                {
                    text: "User",
                    value: "user",
                    disabled: true,
                },
            ],
            filterMode: "tree",
            filterSearch: true,
            onFilter: (value, record) => record.roles.includes(value),
            render: (_, { roles }) => (
                <>
                    {roles.map((role) => {
                        let color = "";
                        switch (role) {
                            case "moderator":
                                color = "geekblue";
                                break;
                            case "admin":
                                color = "green";
                                break;
                            case "user":
                                color = "volcano";
                                break;
                            default:
                                color = "cyan";
                        }
                        return (
                            <Tag color={color} key={role}>
                                {role.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    {user.id !== record.id && (
                        <>
                            <Button
                                type="primary"
                                onClick={() => handleModalOpen(record)}
                            >
                                Ubah Roles
                            </Button>

                            <Popconfirm
                                title="Apakah Anda yakin menghapus data ini?"
                                onConfirm={() => handleConfirm(record.id)}
                                okText="Ya"
                                cancelText="Tidak"
                            >
                                <Button danger type="primary">
                                    Delete
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const getAccounts = async (req, res) => {
        setIsLoadingData(true);
        try {
            const response = await axios.get(
                "https://bloodio-api.vercel.app/api/user/",
                {
                    headers: {
                        "x-access-token": `${user.accessToken}`,
                    },
                }
            );

            setIsLoadingData(false);
            setAccounts(response.data);
        } catch (err) {
            setIsLoadingData(false);
            setError(true);
        }
    };

    useEffect(() => {
        getAccounts();
    }, []);

    useEffect(() => {
        setData(
            accounts.map((acc) => {
                return {
                    key: acc.id,
                    id: acc.id,
                    username: acc.username,
                    roles: acc.roles,
                };
            })
        );
    }, [accounts]);

    const onCheckboxChange = (list) => {
        setCheckedList(list);
    };

    const onSubmitRoleChange = async () => {
        setIsLoading(true);

        try {
            await axios.patch(
                `https://bloodio-api.vercel.app/api/user/${focusedAcc.id}`,
                {
                    roles: checkedList,
                },
                {
                    headers: {
                        "x-access-token": `${user.accessToken}`,
                    },
                }
            );

            getAccounts();

            notification["success"]({
                message: "Berhasil!",
                description: `Perubahan role akun berhasil disimpan`,
            });
        } catch (error) {
            notification["error"]({
                message: "Gagal!",
                description: "Perubahan role akun gagal disimpan",
            });
        }
        setIsLoading(false);
        setIsModalOpen(false);
    };

    return (
        <>
            {error ? (
                <Result
                    status="error"
                    title="401"
                    subTitle="Maaf, anda tidak memiliki akses untuk halaman ini."
                />
            ) : (
                <>
                    <Modal
                        title={`Pengubahan Roles Akun ${focusedAcc.username}`}
                        open={isModalOpen}
                        onOk={handleOkModal}
                        onCancel={handleCancelModal}
                        footer={[
                            <Button
                                key="submit"
                                type="primary"
                                onClick={() => onSubmitRoleChange()}
                                loading={isLoading}
                            >
                                Simpan
                            </Button>,
                            <Button onClick={() => setIsModalOpen(false)}>
                                Batal
                            </Button>,
                        ]}
                    >
                        <Form name="edit_roles">
                            <Form.Item
                                name="remember"
                                valuePropName="checked"
                                noStyle
                            >
                                <CheckboxGroup
                                    options={options}
                                    value={checkedList}
                                    onChange={onCheckboxChange}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Title
                        data-aos="zoom-out"
                        level={3}
                        style={{ textAlign: "center", margin: "1rem" }}
                    >
                        Pengelolaan Akun Sistem
                    </Title>
                    <Title
                        data-aos="zoom-in"
                        level={5}
                        style={{
                            textAlign: "center",
                            margin: "1rem",
                        }}
                    >
                        ???? MODERATOR ONLY ????
                    </Title>

                    <Card
                        data-aos="fade"
                        data-aos-delay={200}
                        title="Tabel List Akun Terdaftar"
                        bordered={false}
                        style={{
                            width: "100%",
                            margin: "2rem auto",
                            borderRadius: 8,
                            padding: "24px 16px",
                            filter: "drop-shadow(0px 4px 40px rgba(66, 95, 138, 0.1))",
                        }}
                    >
                        {isLoadingData ? (
                            <Skeleton active />
                        ) : (
                            <div data-aos="fade">
                                <Table columns={columns} dataSource={data} />
                            </div>
                        )}
                    </Card>
                </>
            )}
        </>
    );
}
