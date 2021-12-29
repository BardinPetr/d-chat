import React from 'react';

const UserCheck = ({isOk, children}) => (
	<div>
		{isOk ? children : 
			<div>
				<article className="message is-danger">
					<div className="message-header">
						<p>Not a member</p>
					</div>
					<div className="message-body">
					You should be subscribed to this topic to enter the conference
					</div>
				</article>
			</div>
		}
	</div>
);

export default UserCheck;