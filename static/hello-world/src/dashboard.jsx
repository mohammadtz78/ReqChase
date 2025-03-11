import { useState, useEffect } from 'react';
import { Table } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

import Loader from './loader';
import { invoke } from '@forge/bridge';

const dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await invoke('getDashboardData');
            console.log(data)
            setData(data?.data || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    }


    return (
        <div>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <h5>Dashboard</h5>
                    <br />
                    <Table data={data} bordered cellBordered isTree rowKey="id" minHeight={400}>
                        <Column width={180}>
                            <HeaderCell>Name</HeaderCell>
                            <Cell dataKey='name' />
                        </Column>
                        <Column width={180}>
                            <HeaderCell>Description</HeaderCell>
                            <Cell dataKey='description' />
                        </Column>
                    </Table>
                </>
            )}

        </div>
    )
}

export default dashboard