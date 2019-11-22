import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import ReactRouterDOM, { HashRouter, Link, Route } from 'react-router-dom'
import axios from 'axios';



const rootEl = document.querySelector('#root');


class Nav extends Component {
    constructor( { props } ) {
        super();
        this.state = {
            selected: 0
        }
    }
    componentDidMount() {
        const selected = Number(this.props.location.pathname.slice(1));
        this.setState({selected})
    }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;
        if (currentSpot !== priorSpot) {
            const selected = Number(currentSpot.slice(1));
            this.setState({selected})
        }

    }
    // eslint-disable-next-line complexity
    render() {
        const { selected } = this.state;
        const linkMaker = Array(7).fill('');
        return (
            <div className='nav'>
                <a href={selected > 0 ? `#${selected - 1}` : '#'} >Previous</a>
                {/* <a href="#0" className={selected === 0 ? 'current': ''}>1</a>
                <a href="#1" className={selected === 1 ? 'current': ''}>2</a>
                <a href="#2" className={selected === 2 ? 'current': ''}>3</a>
                <a href="#3" className={selected === 3 ? 'current': ''}>4</a>
                <a href="#4" className={selected === 4 ? 'current': ''}>5</a>
                <a href="#5" className={selected === 5 ? 'current': ''}>6</a>
                <a href="#6" className={selected === 6 ? 'current': ''}>7</a> */}
                {
                    linkMaker.map((no, idx) => {
                        return <a
                            href={`#${idx}`}
                            className={selected === idx ? 'current' : ''}
                            >{idx + 1}</a>
                    })
                }
                <a
                    href={selected < 6 ? `#${selected + 1}` : '#6'}
                    >Next</a>
            </div>
        )
    }
}


// eslint-disable-next-line react/no-multi-comp
class List extends Component {
    constructor( { employees, props, updateEmployees } ) {
        super();
        this.state = {
            employees,
            updateEmployees
        }
    }
    componentDidMount() {
        const selected = Number(location.hash.slice(2));
        axios.get(`/api/employees/${Number(selected)}`) 
            .then(response => {
                const employees = response.data.rows;
                this.state.updateEmployees(employees);
                this.setState({employees})
            })
    }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;

        if (currentSpot !== priorSpot) {
            const selected = currentSpot.slice(1)
            axios.get(`/api/employees/${Number(selected)}`) 
                .then(response => {
                    const employees = response.data.rows;
                    this.state.updateEmployees(employees);
                    this.setState({employees})
                })
        }

    }
    render() {
        const { employees } = this.state;
        return (
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email </th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody className='employees'>
                    {
                        employees.map(employee => {
                            return (
                                <tr key={employee.id}>
                                    <td>{employee.firstName}</td>
                                    <td>{employee.lastName}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.title}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }
}

// eslint-disable-next-line react/no-multi-comp
class App extends Component {
    constructor() {
        super()
        this.state = {
            employees: [],
            selected: 0,
        }
        this.updateEmployees = this.updateEmployees.bind(this);
    }
    // async componentDidMount() { // need something for the correct page, // might be response.data.rows
    //     const { selected } = this.state // could also do this with location.hash or params?
    //     await axios.get(`/api/employees/${Number(selected)}`) 
    //         .then(response => {
    //             const employees = response.data.rows;
    //             // console.log('employees are: ', employees)
    //             this.setState({employees})
    //             // console.log(this.state.employees)
    //         })
    // }

    updateEmployees(newEmployees) {
        this.setState({employees: newEmployees})
        console.log('app employees: ', this.state.employees)
    }
    render() {
        const { employees, selected } = this.state;
        const { updateEmployees } = this;
        return (
            <HashRouter>
                <Route render={(props) => <Nav employees={ employees } selected = { selected } {...props} />} />
                <Route path ='/:page?' render={(props) => <List employees={ employees } selected = { selected } updateEmployees = { updateEmployees } {...props} />} />
            </HashRouter>
        )
    }
}


ReactDOM.render(<App />, rootEl);
