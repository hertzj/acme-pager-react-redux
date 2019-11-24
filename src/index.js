import { createStore } from 'redux';
import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import ReactRouterDOM, { HashRouter, Link, Route, Switch } from 'react-router-dom'
import axios from 'axios';


const initialState = {
    employees: [],
    selected: 0,
    count: 0,
    submittedEmployee: {},
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case 'pageChange': 
            let newPage = {
                ...state,
                selected: action.data
            }
            return newPage;
        case 'newEmployees':
            let newEmployees = {
                ...state,
                employees: action.data
            }
        return newEmployees;
        case 'setCount': {
            let newState = {
                ...state,
                count: action.data,
            }
            return newState;
        }
        case 'employeeSubmit':
            let submittedEmployee = {
                ...state,
                submittedEmployee: action.data,
            }
            return submittedEmployee;
    default:
            return state
    }
}


const store = createStore(reducer);

const fetchEmployees = async () => {
    const page = store.getState().selected;
    await axios.get(`/api/employees/${page}`)
        .then(response => {
            const employees = response.data.rows;
            const count = response.data.count
            store.dispatch( {
                type: 'newEmployees',
                data: employees,
            })
            store.dispatch({
                type: 'setCount',
                data: count,
            })
        })
}


const rootEl = document.querySelector('#root');


class Nav extends Component {
    constructor(props) {
        super();
        this.state = store.getState()
    }
    componentWillUnmount() {
        this.unsubscribe();

    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState(store.getState()));
    }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;
        if (currentSpot !== priorSpot) {
            const selected = Number(currentSpot.slice(1));
            store.dispatch( {
                data: selected,
                type: 'pageChange'
            })
        }

    }
    // eslint-disable-next-line complexity
    render() {
        const selected = store.getState().selected;
        let numPages = Math.ceil(store.getState().count / 50)
        const linkMaker = Array(numPages).fill('');
        const path = this.props.location.pathname.slice(1)
        return (
            <div className='nav'>
                <a href={selected > 0 ? `#${selected - 1}` : '#'} >Previous</a>
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
                <a href="#create" className={path === 'create' ? 'current' : ''}>Create Employee</a>
            </div>
        )
    }
}


// eslint-disable-next-line react/no-multi-comp
class List extends Component {
    constructor(props) {
        super();
        this.state = store.getState();
    }
    componentWillUnmount() {
        this.unsubscribe();

    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState(store.getState()))
    }
    componentDidUpdate(prevProps) {
        const currentSpot = this.props.location.pathname;
        const priorSpot = prevProps.location.pathname;
        if (currentSpot !== priorSpot) {
            fetchEmployees()
        }
    }
    deleteEmployee(e) {
        const id = e.target.parentNode.parentNode.dataset.id;
        axios.delete(`/api/employees/rows/${id}`)
        fetchEmployees();
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
                                <tr key={employee.id} data-id={employee.id}>
                                    <td>{employee.firstName}</td>
                                    <td>{employee.lastName}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.title}</td>
                                    <td><button onClick={(e) => this.deleteEmployee(e)}>Delete!</button></td>                                    
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
class Create extends Component {
    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            title: '',
        }
    }
    handleChange(ev) {
        const field = ev.target.name;
        this.setState({[field]: ev.target.value})
    }

    handleSubmit(e) {
        e.preventDefault();
        const { firstName, lastName, email, title } = this.state
        const newEmployee = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            title: title,
        }
        store.dispatch({
            data: newEmployee,
            type: 'employeeSubmit'
        })
        const submitted = store.getState().submittedEmployee
        axios.post('/api/employees/', submitted);
        this.setState({
            firstName: '',
            lastName: '',
            email: '',
            title: '',
        })
        const inputs = [...document.querySelectorAll('input')]
        inputs.forEach(input => {
            input.value = ''
        });
    }

    render() {
        return (
            <form onSubmit={(e) => this.handleSubmit(e)}>
                <h3>Create New Employee</h3>
                <input type="text" name="firstName" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="lastName" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="email" onChange={(e) => this.handleChange(e)}/>
                <input type="text" name="title" onChange={(e) => this.handleChange(e)}/>
                <button>Create</button>
            </form>
        )
    }
}

// eslint-disable-next-line react/no-multi-comp
class App extends Component {
    componentDidMount() {
        fetchEmployees();
    }
    render() {
        return (
            <div className='header'>
            <h1>ACME Pager</h1>
            <HashRouter>
                <Route component = { Nav } />
                <Switch>
                    <Route path='/create' component = { Create } />
                    <Route path ='/:page?' component = { List } />
                </Switch>

            </HashRouter>
            </div>
        )
    }
}


ReactDOM.render(<App />, rootEl);
