import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import ReactRouterDOM, { HashRouter, Link, Route } from 'react-router-dom'
import axios from 'axios';

// probably do something with props (match params) for which group to render


const rootEl = document.querySelector('#root');

// ReactDOM.render(<div>Hello</div>, rootEl);

class Nav extends Component {
    constructor( { props } ) {
        super();
        this.state = {
            selected: 0
        }
    }
    componentDidMount() {
        // const selected = Number(location.hash.slice(2));
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
        // console.log('nav location:', location)
        // console.log('nav hash: ', location.hash.slice(2))
        // const selected = Number(location.hash.slice(2)); // switch this to a stateful selected
        // console.log('and selected is: ', selected)
        const { selected } = this.state;
        // const { updateSelected } = this.props
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
                            // onClick={() => updateSelected(idx)}
                            >{idx + 1}</a>
                    })
                }
                <a
                    href={selected < 6 ? `#${selected + 1}` : '#6'}
                    // onClick={() => selected < 6 ? updateSelected(selected + 1) : null}
                    >Next</a>
            </div>
        )
    }
}

// I think this will DRY out the links
// const linkMaker = Array(7).fill('');
// {
//     linkMaker.map((no, idx) => {
//         return <a
//             href={`#${idx}`}
//             className={selected === idx ? 'current' : ''}
//             onClick={() => this.setState({selected: idx + 1})}
//             >{idx + 1}</a>
//     })
// }


// eslint-disable-next-line react/no-multi-comp
class List extends Component {
    constructor( { employees, props } ) {
        super();
        this.state = {
            employees,
        }
    }
    componentDidMount() { // need something for the correct page, // might be response.data.rows
        // const { selected } = this.state // could also do this with location.hash or params?
        const selected = Number(location.hash.slice(2));
        // console.log('list selected from location.hash: ', selected)
        axios.get(`/api/employees/${Number(selected)}`) 
            .then(response => {
                const employees = response.data.rows;
                this.setState({employees})
            })
    }
    componentDidUpdate(prevProps) { // need something for the correct page
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;

        if (currentSpot !== priorSpot) {
            // console.log('in cdu if')
            // const { selected } = this.state // could also do this with location.hash or params?
            const selected = currentSpot.slice(1)
            axios.get(`/api/employees/${Number(selected)}`) 
                .then(response => {
                    const employees = response.data.rows;
                    // console.log('employees are: ', employees)
                    this.setState({employees})
                    // console.log(this.state.employees)
                })
        }

    }
    render() {
        const { employees } = this.state;
        // console.log('list location', location);
        // console.log('list selected:', selected)
        // console.log('list employees: ', employees)
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
        // this.updateSelected = this.updateSelected.bind(this);
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

    // updateSelected(newSelected) {
    //     this.setState({selected: newSelected})
    //     console.log('app selected: ', this.state.selected);
    // }
    updateEmployees(newEmployees) {
        this.setState({employees: newEmployees})
    }
    render() {
        const { employees, selected } = this.state;
        const { updateSelected, updateEmployees } = this;
        return (
            <HashRouter>
                <Route render={(props) => <Nav employees={ employees } selected = { selected } {...props} />} />
                <Route path ='/:page?' render={(props) => <List employees={ employees } selected = { selected } updateEmployees = { updateEmployees } {...props} />} />
            </HashRouter>
        )
    }
}


ReactDOM.render(<App />, rootEl);
